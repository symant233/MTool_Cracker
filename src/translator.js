const fs = require("fs");
const { baidu, tencent } = require("./sdk");
const GeminiTranslator = require("./gemini");

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

function initialCheck(id, body) {
  fs.writeFileSync(`dist/${id}-origin.json`, body.realDataJsonStr);
  const arr = JSON.parse(body.realDataJsonStr);
  let obj = parseBody(id, body);
  let page = 0; // 翻译开始页, 第一页为0
  let step = 100; // 翻译步长, 默认100条一次请求
  if (!fs.existsSync(`dist/${id}`)) {
    fs.mkdirSync(`dist/${id}`);
  } else {
    const files = fs.readdirSync(`dist/${id}`);
    page = files.length;
    console.log(`translator.js >>> 继续上次的翻译, 载入前${page}页数据...`);
    files.forEach((file) => {
      const data = JSON.parse(fs.readFileSync(`dist/${id}/${file}`, "utf8"));
      obj.data = Object.assign(obj.data, data);
    });
  }
  const digit = (arr.length / step).toString().split(".")[0].length;
  return [arr, obj, page, step, digit];
}

async function trsBaidu(id, body) {
  let [arr, obj, page, step, digit] = initialCheck(id, body);
  let str = "";
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

async function trsTencent(id, body) {
  let [arr, obj, page, step, digit] = initialCheck(id, body);
  while (page * step < arr.length) {
    arrPartial = arr.slice(page * step, ++page * step);
    console.log(
      `translator.js >>> p${page - 1} 翻译前 ${page * step} 条, 共 ${
        arr.length
      } 条...`
    );
    let dataArray = await tencent(arrPartial).catch((err) => {
      console.error(err);
    });
    if (!dataArray) {
      page--;
      fs.writeFileSync(
        `dist/err-${id}-p${page}.json`,
        JSON.stringify(arrPartial)
      );
      console.log("translator.js >>> 已保存出错字段, 重试中...");
      await new Promise((r) => setTimeout(r, 5000)); // 等待
    } else {
      const _obj = combineArrays(arrPartial, dataArray);
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

async function trsGemini(id, body) {
  let [arr, obj, page, step, digit] = initialCheck(id, body);
  const gemini = new GeminiTranslator();
  while (page * step < arr.length) {
    arrPartial = arr.slice(page * step, ++page * step);
    console.log(
      `translator.js >>> p${page - 1} 翻译前 ${page * step} 条, 共 ${
        arr.length
      } 条...`
    );
    let _obj = await gemini
      .translate(JSON.stringify(arrPartial))
      .catch((err) => {
        console.error(err);
      });
    if (!_obj) {
      page--;
      fs.writeFileSync(
        `dist/err-${id}-p${page}.json`,
        JSON.stringify(arrPartial)
      );
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

module.exports = { trsBaidu, trsTencent, trsGemini };
