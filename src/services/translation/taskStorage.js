const fs = require("fs");

function addLeadingZeros(num, totalLength) {
  return String(num).padStart(totalLength, "0");
}

function combineArrays(first, second) {
  return first.reduce((acc, val, ind) => {
    acc[val] = second[ind];
    return acc;
  }, {});
}

function parseBody(id, body) {
  return {
    hackVer: body.hackVer,
    gameTitle: body.gameTitle,
    gameTitleTrs: body.gameTitle,
    versionId: body.versionId,
    locale: body.locale,
    engine: body.engine,
    from: body.fromLang,
    to: body.toLang,
    oriFileName: `${id}.json`,
    strLength: 0,
    cacheHitLength: 0,
    data: {},
  };
}

function getPageFilePath(id, page, digit) {
  return `dist/${id}/p${addLeadingZeros(page, digit)}.json`;
}

function logProgress(page, step, total) {
  console.log(
    `translator.js >>> p${page - 1} 翻译前 ${page * step} 条, 共 ${total} 条...`
  );
}

function initializeTask(id, body, step) {
  fs.writeFileSync(`dist/${id}-origin.json`, body.realDataJsonStr);
  const arr = JSON.parse(body.realDataJsonStr);
  const obj = parseBody(id, body);
  let page = 0;

  if (!fs.existsSync(`dist/${id}`)) {
    fs.mkdirSync(`dist/${id}`);
  } else {
    const files = fs
      .readdirSync(`dist/${id}`)
      .filter((file) => /^p\d+\.json$/.test(file))
      .sort();
    page = files.length;
    console.log(`translator.js >>> 继续上次的翻译, 载入前${page}页数据...`);
    files.forEach((file) => {
      const data = JSON.parse(fs.readFileSync(`dist/${id}/${file}`, "utf8"));
      obj.data = Object.assign(obj.data, data);
    });
  }

  const totalPages = Math.max(1, Math.ceil(arr.length / step));
  const digit = String(totalPages).length;
  return { arr, obj, page, digit };
}

function persistPageData(id, page, digit, pageData, obj) {
  fs.writeFileSync(getPageFilePath(id, page, digit), JSON.stringify(pageData));
  obj.data = Object.assign(obj.data, pageData);
}

function persistErrorPage(id, page, payload) {
  fs.writeFileSync(`dist/err-${id}-p${page}.json`, JSON.stringify(payload));
}

function finishTask(id, obj) {
  fs.writeFileSync(`dist/${id}.json`, JSON.stringify(obj));
  console.log("translator.js >>> 翻译完成, 点击加载线上数据获取.");
}

module.exports = {
  combineArrays,
  finishTask,
  initializeTask,
  logProgress,
  persistErrorPage,
  persistPageData,
};
