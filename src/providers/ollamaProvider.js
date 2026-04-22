const axios = require("axios");
const config = require("../config");
const { parseStructuredJson } = require("./shared/json");

class TranslationCountMismatchError extends Error {
  constructor(expected, actual) {
    super(`Ollama 输出格式异常: 期望 ${expected} 条, 实际 ${actual} 条`);
    this.name = "TranslationCountMismatchError";
    this.expected = expected;
    this.actual = actual;
  }
}

function toIndexedInput(textList) {
  return textList.map((text, index) => ({
    index,
    text,
  }));
}

function normalizeTranslations(rawTranslations, expectedLength) {
  if (!Array.isArray(rawTranslations)) {
    throw new TranslationCountMismatchError(expectedLength, "无效");
  }

  // 兼容模型偶发返回 string[] 的情况
  if (rawTranslations.every((item) => typeof item === "string")) {
    if (rawTranslations.length !== expectedLength) {
      throw new TranslationCountMismatchError(
        expectedLength,
        rawTranslations.length,
      );
    }
    return rawTranslations;
  }

  const byIndex = new Array(expectedLength);
  rawTranslations.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }
    const idx = Number(item.index);
    const translation = item.translation ?? item.text ?? item.dst;
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
      rawTranslations.length,
    );
  }
  return byIndex;
}

async function requestBatch(textList, temperature) {
  const indexedInput = toIndexedInput(textList);

  const response = await axios.post(
    `${config.ollama.url}/api/chat`,
    {
      model: config.ollama.model,
      stream: false,
      format: {
        type: "object",
        properties: {
          translations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                index: { type: "integer" },
                translation: { type: "string" },
              },
              required: ["index", "translation"],
            },
          },
        },
        required: ["translations"],
      },
      options: {
        temperature,
      },
      messages: [
        {
          role: "system",
          content:
            "你是一个游戏文本翻译引擎。把用户提供的日语文本逐条翻译成简体中文。禁止解释、禁止合并、禁止遗漏，保持输入顺序，保持 index 不变。",
        },
        {
          role: "user",
          content:
            `请只返回 JSON，结构为 {"translations":[{"index":number,"translation":string}]}。
要求：
1) index 必须覆盖 0 到 ${textList.length - 1} 且每个只出现一次；
2) 不得新增、删除、合并、拆分条目；
3) translation 只填翻译后的简体中文文本。
以下是待翻译数组（含 index）：
` + JSON.stringify(indexedInput),
        },
      ],
      think: false,
    },
    { timeout: config.ollama.timeout },
  );

  const parsed = parseStructuredJson(response.data?.message?.content);
  return normalizeTranslations(parsed?.translations, textList.length);
}

async function translateBatchWithFallback(textList) {
  try {
    return await requestBatch(textList, config.ollama.temperature);
  } catch (error) {
    if (!(error instanceof TranslationCountMismatchError)) {
      throw error;
    }
  }

  try {
    return await requestBatch(textList, 0);
  } catch (error) {
    if (
      !(error instanceof TranslationCountMismatchError) ||
      textList.length <= 1
    ) {
      throw error;
    }
  }

  console.warn(
    `ollamaProvider >>> 批次 ${textList.length} 条输出不稳定，自动拆分为更小批次重试`,
  );
  const mid = Math.ceil(textList.length / 2);
  const left = await translateBatchWithFallback(textList.slice(0, mid));
  const right = await translateBatchWithFallback(textList.slice(mid));
  return left.concat(right);
}

async function translateBatch(textList) {
  if (!Array.isArray(textList) || textList.length === 0) {
    return [];
  }
  return translateBatchWithFallback(textList);
}

module.exports = {
  translateBatch,
};
