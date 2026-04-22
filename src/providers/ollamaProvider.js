const axios = require("axios");
const config = require("../config");
const { parseStructuredJson } = require("./shared/json");

async function translateBatch(textList) {
  if (!Array.isArray(textList) || textList.length === 0) {
    return [];
  }

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
              type: "string",
            },
          },
        },
        required: ["translations"],
      },
      options: {
        temperature: config.ollama.temperature,
      },
      messages: [
        {
          role: "system",
          content:
            "你是一个游戏文本翻译引擎。把用户提供的日语文本逐条翻译成简体中文。禁止解释、禁止合并、禁止遗漏，保持输入顺序。",
        },
        {
          role: "user",
          content:
            "请只返回 JSON，结构为 {\"translations\": string[]}。以下是待翻译数组：\n" +
            JSON.stringify(textList),
        },
      ],
    },
    { timeout: config.ollama.timeout }
  );

  const parsed = parseStructuredJson(response.data?.message?.content);
  const translated = parsed?.translations;
  if (!Array.isArray(translated) || translated.length !== textList.length) {
    throw new Error(
      `Ollama 输出格式异常: 期望 ${textList.length} 条, 实际 ${
        Array.isArray(translated) ? translated.length : "无效"
      } 条`
    );
  }
  return translated;
}

module.exports = {
  translateBatch,
};
