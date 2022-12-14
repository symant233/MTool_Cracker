const fs = require("fs");
const { baidu } = require("./sdk");

function addLeadingZeros(num, totalLength) {
  return String(num).padStart(totalLength, "0");
}

async function translator(id, body) {
  if (!fs.existsSync(`dist/${id}`)) fs.mkdirSync(`dist/${id}`);
  fs.writeFileSync(`dist/${id}-origin.json`, body.realDataJsonStr);
  const arr = JSON.parse(body.realDataJsonStr);
  let str = "";
  let obj = {
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
  let page = 0; // 翻译开始页, 第一页为0
  let step = 100; // 翻译步长, 默认100条一次请求
  const digit = (arr.length / step).toString().split(".")[0].length;
  console.log(digit);
  while (page * step < arr.length) {
    str = arr
      .slice(page * step, ++page * step)
      .map((s) => s.replaceAll("\n", "^$")) // 替换已存在的换行符
      .join(" \n");
    console.log(
      `translator.js >>> p${page - 1} 翻译前 ${page * step} 条, 共 ${
        arr.length
      } 条...`
    );
    let _obj = await baidu(str).catch((err) => {
      console.error(err);
    });
    if (!_obj) {
      page--;
      fs.writeFileSync(`dist/err-${id}-p${page}.json`, JSON.stringify({ str }));
      console.log("translator.js >>> 已保存出错字段, 重试中...");
      await new Promise((r) => setTimeout(r, 5000)); // 等待
    } else {
      fs.writeFileSync(
        `dist/${id}/p${addLeadingZeros(page, digit)}.json`,
        JSON.stringify(_obj)
      );
      obj.data = Object.assign(obj.data, _obj);
    }
  }
  fs.writeFileSync(`dist/${id}.json`, JSON.stringify(obj));
  console.log("translator.js >>> 翻译完成, 点击加载线上数据获取.");
}

module.exports = translator;
