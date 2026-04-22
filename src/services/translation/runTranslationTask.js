const {
  combineArrays,
  finishTask,
  initializeTask,
  logProgress,
  persistErrorPage,
  persistPageData,
} = require("./taskStorage");

const RETRY_DELAY = 5000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTranslationTask(id, body, provider) {
  const step = provider.pageSize;
  const { arr, obj, page: restoredPage, digit } = initializeTask(id, body, step);
  let page = restoredPage;
  while (page * step < arr.length) {
    const arrPartial = arr.slice(page * step, ++page * step);
    logProgress(page, step, arr.length);

    const dataArray = await provider.translateBatch(arrPartial).catch((err) => {
      console.error(err);
      return null;
    });
    if (!Array.isArray(dataArray) || dataArray.length !== arrPartial.length) {
      page--;
      persistErrorPage(id, page, { engine: provider.key, data: arrPartial });
      console.log("translator.js >>> 已保存出错字段, 重试中...");
      await sleep(RETRY_DELAY);
      continue;
    }

    persistPageData(id, page, digit, combineArrays(arrPartial, dataArray), obj);
  }

  finishTask(id, obj);
}

module.exports = {
  runTranslationTask,
};
