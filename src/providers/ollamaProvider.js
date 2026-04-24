const axios = require("axios");
const config = require("../config");
const { parseStructuredJson } = require("./shared/json");

const JAPANESE_RE = /[\u3040-\u30ff\u3400-\u9fff]/;

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    t: {
      type: "array",
      items: {
        type: "object",
        properties: {
          i: { type: "integer" },
          trs: { type: "string" },
        },
        required: ["i", "trs"],
      },
    },
  },
  required: ["t"],
};

const SYSTEM_PROMPT =
  "你是游戏文本翻译引擎。任务是把日语逐条翻译为简体中文，并严格按给定索引返回结果。你只能输出 JSON，不得输出解释、注释、代码块、前后缀文本。翻译要求忠实原文，不做内容弱化、净化或委婉改写。";

class TranslationCountMismatchError extends Error {
  constructor(expected, actual) {
    super(`Ollama 输出格式异常: 期望 ${expected} 条, 实际 ${actual} 条`);
    this.name = "TranslationCountMismatchError";
    this.expected = expected;
    this.actual = actual;
  }
}

function hasJapanese(text) {
  return JAPANESE_RE.test(String(text));
}

function toIndexedInput(textList) {
  return textList.map((text, index) => [index, String(text)]);
}

function buildUserPrompt(indexedInput, mode = "strict") {
  const count = indexedInput.length;
  const relaxedTail =
    mode === "relaxed"
      ? `
12) 若你对某项不确定，trs 直接填该项原文，不得跳过；
13) 绝对禁止返回空数组；即使无法翻译也必须返回 ${count} 条；
`
      : "";

  return `请翻译数组 d 中每条文本，返回 JSON 对象，结构必须为：
{"t":[{"i":0,"trs":"..."}, ...]}

硬性约束（必须全部满足）：
1) 仅返回一个 JSON 对象，不得包含 markdown 代码块标记（如 \`\`\`）；
2) t 的长度必须等于输入条数 ${count}；
3) i 必须完整覆盖 0..${count - 1}，每个 i 只能出现一次；
4) 不得新增、删除、合并、拆分任意条目；
5) 保持原顺序语义：每个 i 的 trs 必须对应同一个 i 的原文；
6) 对关键语义保持直译，不要弱化或回避；
7) 对“脚本格式片段”（如 ", 'sequential', 'continue', true）输出语义化中文短语，去掉英文逗号、英文引号、布尔字面量等符号；
8) 对纯符号项（如 ; / =1）可原样返回；
9) 对常见英文控制词（sequential / continue / random / idle / play）优先翻译成中文含义；
10) 若 trs 内需要出现英文双引号字符 "，必须转义为 \\"；
11) 示例：", 'sequential', 'continue', true -> 顺序继续； "'Kiss05', 'Idle -> 亲吻待机；
${relaxedTail}

输入 d（格式: [i, text]）:
` + JSON.stringify(indexedInput);
}

function buildGeneratePayload(textList, mode = "strict") {
  return {
    model: config.ollama.model,
    stream: false,
    format: OUTPUT_SCHEMA,
    options: {
      temperature: config.ollama.temperature,
    },
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(toIndexedInput(textList), mode),
  };
}

function normalizeTranslations(rawTranslations, expectedLength) {
  if (!Array.isArray(rawTranslations)) {
    throw new TranslationCountMismatchError(expectedLength, "无效");
  }

  if (rawTranslations.every((item) => typeof item === "string")) {
    if (rawTranslations.length !== expectedLength) {
      throw new TranslationCountMismatchError(
        expectedLength,
        rawTranslations.length
      );
    }
    return rawTranslations;
  }

  const byIndex = new Array(expectedLength);
  rawTranslations.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const idx = Number(item.i ?? item.index);
    const translation = item.trs ?? item.translation ?? item.text ?? item.dst;
    if (!Number.isInteger(idx) || idx < 0 || idx >= expectedLength) {
      return;
    }
    if (typeof translation !== "string") {
      return;
    }
    byIndex[idx] = translation;
  });

  if (byIndex.some((item) => typeof item !== "string")) {
    throw new TranslationCountMismatchError(
      expectedLength,
      rawTranslations.length
    );
  }
  return byIndex;
}

async function requestBatch(textList, mode = "strict") {
  const response = await axios.post(
    `${config.ollama.url}/api/generate`,
    buildGeneratePayload(textList, mode),
    { timeout: config.ollama.timeout }
  );

  const parsed = parseStructuredJson(
    response.data?.response ?? response.data?.message?.content
  );
  const translations = parsed?.t ?? parsed?.translations;
  return normalizeTranslations(translations, textList.length);
}

async function translateBatch(textList) {
  if (!Array.isArray(textList) || textList.length === 0) {
    return [];
  }

  try {
    return await requestBatch(textList, "strict");
  } catch (error) {
    if (!(error instanceof TranslationCountMismatchError)) {
      throw error;
    }
  }

  // 二次尝试：放宽约束但仍要求同长度返回，优先避免 t=[]。
  try {
    return await requestBatch(textList, "relaxed");
  } catch (error) {
    if (!(error instanceof TranslationCountMismatchError)) {
      throw error;
    }
  }

  // 最后兜底：仅翻译含日文条目，脚本片段直接回填原文，降低 JSON 失真概率。
  const source = textList.map((item) => String(item));
  const targetIndices = [];
  const targetTexts = [];
  source.forEach((text, index) => {
    if (hasJapanese(text)) {
      targetIndices.push(index);
      targetTexts.push(text);
    }
  });

  if (targetTexts.length === 0) {
    return source;
  }

  let translated;
  try {
    translated = await requestBatch(targetTexts, "strict");
  } catch (error) {
    if (!(error instanceof TranslationCountMismatchError)) {
      throw error;
    }
    try {
      translated = await requestBatch(targetTexts, "relaxed");
    } catch (nestedError) {
      if (!(nestedError instanceof TranslationCountMismatchError)) {
        throw nestedError;
      }
      // 最终兜底：避免同一分页无限重试，直接回填原文继续流程。
      console.warn("ollamaProvider >>> 批次输出持续异常，已回填原文以继续流程");
      translated = targetTexts;
    }
  }
  const result = source.slice();
  targetIndices.forEach((originalIndex, idx) => {
    result[originalIndex] = translated[idx];
  });
  return result;
}

module.exports = {
  translateBatch,
};
