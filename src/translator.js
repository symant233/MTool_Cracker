const fs = require("fs");
const { baidu } = require("./sdk");

async function translator(id, body) {
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
  let page = 0;
  let step = 100;
  while (page * step < arr.length) {
    str = arr
      .slice(page * step, ++page * step)
      .map((s) => s.replace("\n", "$$")) // 替换已存在的换行符
      .join("\n");
    console.log(
      `translator.js >>> 翻译前 ${page * step} 条, 共 ${arr.length} 条...`
    );
    let _obj = await baidu(str).catch((err) => {
      console.error(err);
    });
    if (!_obj) {
      page--;
      console.log("translator.js >>> 重试中...");
      await new Promise((r) => setTimeout(r, 2000));
    }
    obj.data = Object.assign(obj.data, _obj);
  }
  fs.writeFileSync(`dist/${id}.json`, JSON.stringify(obj));
  console.log("translator.js >>> 翻译完成, 点击加载线上数据获取.");
}

module.exports = translator;
