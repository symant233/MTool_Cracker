const MD5 = require("./md5");
const axios = require("axios");

async function translate(query) {
  const appid = "20210414000779439";
  const key = "Aguwj0hl54_qDCJbn9rZ";
  const salt = new Date().getTime();
  const sign = MD5(appid + query + salt + key);
  return axios({
    url: "http://api.fanyi.baidu.com/api/trans/vip/translate",
    method: "post",
    responseType: "application/x-www-form-urlencoded",
    params: {
      q: query,
      appid: appid,
      salt: salt,
      from: "jp",
      to: "zh",
      sign: sign,
    },
  }).then(function (response) {
    const obj = {};
    response.data.trans_result.forEach((i) => {
      obj[i.src] = i.dst;
    });
    return obj;
  });
}

async function test() {
  const tmp = await translate(
    "奴隷エルフと大魔女の呪い\n使用者の状態異常をすべて治す。\nギガスランページ\nはギガスランページを放った！"
  );
  console.log(tmp);
}

test();
