require("dotenv").config({ path: "working.env" });

function toNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

const config = {
  translatorEngine: (process.env.TRANSLATOR_ENGINE || "tencent").toLowerCase(),
  ollama: {
    url: (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(
      /\/+$/,
      ""
    ),
    model: process.env.OLLAMA_MODEL || "gemma4",
    timeout: toNumber(process.env.OLLAMA_TIMEOUT, 120000),
    temperature: toNumber(process.env.OLLAMA_TEMPERATURE, 1.0),
  },
  pageSize: {
    baidu: 100,
    tencent: 100,
    // 本地模型通常可承载更大批次，固定为 60 减少请求开销。
    ollama: 60,
  },
};

module.exports = config;
