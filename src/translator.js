const { listProviderKeys, providers, resolveProvider } = require("./providers");
const { runTranslationTask } = require("./services/translation");

function createTranslator(providerKey) {
  const provider = providers[providerKey];
  if (!provider) {
    throw new Error(`未知翻译 Provider: ${providerKey}`);
  }
  return async function translateByProvider(id, body) {
    return runTranslationTask(id, body, provider);
  };
}

const trsBaidu = createTranslator("baidu");
const trsTencent = createTranslator("tencent");
const trsOllama = createTranslator("ollama");

const translators = listProviderKeys().reduce((acc, key) => {
  acc[key] = createTranslator(key);
  return acc;
}, {});

function resolveTranslator(engine) {
  const resolved = resolveProvider(engine);
  const selected = resolved.selected;
  return {
    selected,
    translator: translators[selected],
    fallback: resolved.fallback,
  };
}

module.exports = {
  createTranslator,
  resolveTranslator,
  trsBaidu,
  trsTencent,
  trsOllama,
  translators,
};
