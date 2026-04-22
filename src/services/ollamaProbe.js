const axios = require("axios");
const config = require("../config");

function matchesModel(configuredModel, listedModel) {
  if (!configuredModel || !listedModel) {
    return false;
  }
  if (listedModel === configuredModel) {
    return true;
  }
  if (listedModel === `${configuredModel}:latest`) {
    return true;
  }
  return listedModel.startsWith(`${configuredModel}:`);
}

async function probeOllama() {
  try {
    const response = await axios.get(`${config.ollama.url}/api/tags`, {
      timeout: config.ollama.timeout,
    });
    const modelNames = (response.data?.models || [])
      .map((item) => item.name)
      .filter(Boolean);
    const modelReady = modelNames.some((name) =>
      matchesModel(config.ollama.model, name)
    );

    if (!modelReady) {
      return {
        ok: false,
        reason: `已连接 Ollama，但未找到模型 "${config.ollama.model}"`,
        models: modelNames,
      };
    }

    return {
      ok: true,
      reason: `Ollama 探活通过，模型 "${config.ollama.model}" 可用`,
      models: modelNames,
    };
  } catch (error) {
    const detail = error?.message || "未知错误";
    return {
      ok: false,
      reason: `Ollama 探活失败: ${detail}`,
      models: [],
    };
  }
}

async function runOllamaStartupProbe(selectedEngine) {
  if (selectedEngine !== "ollama") {
    return;
  }

  const result = await probeOllama();
  if (result.ok) {
    console.log(`[startup] ${result.reason}`);
    return;
  }

  const available = result.models.length
    ? result.models.join(", ")
    : "(无可用模型列表)";
  console.warn(`[startup] ${result.reason}`);
  console.warn(`[startup] 可用模型: ${available}`);
  console.warn(
    `[startup] 请先执行: ollama pull ${config.ollama.model}，然后重启服务`
  );
}

module.exports = {
  probeOllama,
  runOllamaStartupProbe,
};
