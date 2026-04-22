const { baiduProvider, ollamaProvider, tencentProvider } = require("./providers");

// 兼容旧接口：baidu(query) -> { [src]: dst }
const baidu = baiduProvider.translateQuery;
// 统一 Provider 接口：translateBatch(string[]) -> Promise<string[]>
const tencent = tencentProvider.translateBatch;
const ollama = ollamaProvider.translateBatch;

module.exports = {
  baidu,
  ollama,
  tencent,
};
