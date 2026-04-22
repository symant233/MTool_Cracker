const config = require("../config");
const baiduProvider = require("./baiduProvider");
const tencentProvider = require("./tencentProvider");
const ollamaProvider = require("./ollamaProvider");

const providers = {
  baidu: {
    key: "baidu",
    pageSize: config.pageSize.baidu,
    translateBatch: baiduProvider.translateBatch,
  },
  tencent: {
    key: "tencent",
    pageSize: config.pageSize.tencent,
    translateBatch: tencentProvider.translateBatch,
  },
  ollama: {
    key: "ollama",
    pageSize: config.pageSize.ollama,
    translateBatch: ollamaProvider.translateBatch,
  },
};

function listProviderKeys() {
  return Object.keys(providers);
}

function resolveProvider(engine) {
  const preferred = (engine || "").toLowerCase();
  const selected = providers[preferred] ? preferred : "tencent";
  return {
    selected,
    provider: providers[selected],
    fallback: selected !== preferred,
  };
}

module.exports = {
  baiduProvider,
  tencentProvider,
  ollamaProvider,
  listProviderKeys,
  providers,
  resolveProvider,
};
