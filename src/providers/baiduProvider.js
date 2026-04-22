const axios = require("axios");
const MD5 = require("../md5");

function encodeLineBreak(text) {
  return String(text).replaceAll("\n", "^$");
}

function decodeLineBreak(text) {
  return String(text || "").replace(/(\^\$|\$\$)/g, "\n");
}

async function requestBaiduTranslation(query) {
  const appid = process.env.APPID;
  const key = process.env.KEY;
  if (!appid || !key) {
    throw new Error("缺少 APPID 或 KEY，请检查 working.env");
  }

  const salt = Date.now();
  const sign = MD5(appid + query + salt + key);
  const response = await axios({
    url: "http://api.fanyi.baidu.com/api/trans/vip/translate",
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    params: {
      appid,
      salt,
      from: "jp",
      to: "zh",
      sign,
    },
    data: `q=${encodeURIComponent(query)}`,
  });

  const items = response.data?.trans_result;
  if (!Array.isArray(items)) {
    throw new Error(`Baidu 返回异常: ${JSON.stringify(response.data)}`);
  }
  return items;
}

async function translateQuery(query) {
  const items = await requestBaiduTranslation(query);
  const obj = {};
  items.forEach((item) => {
    obj[decodeLineBreak(item.src)] = decodeLineBreak(item.dst);
  });
  return obj;
}

async function translateBatch(textList) {
  if (!Array.isArray(textList) || textList.length === 0) {
    return [];
  }
  const query = textList.map(encodeLineBreak).join(" \n");
  const items = await requestBaiduTranslation(query);
  if (items.length !== textList.length) {
    throw new Error(
      `Baidu 批量翻译数量不匹配: expect=${textList.length}, actual=${items.length}`
    );
  }
  return items.map((item) => decodeLineBreak(item.dst));
}

module.exports = {
  translateBatch,
  translateQuery,
};
