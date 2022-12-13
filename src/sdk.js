const MD5 = require("./md5");
const axios = require("axios");
require("dotenv").config({ path: "working.env" });

async function baidu(query) {
  const appid = process.env.APPID;
  const key = process.env.KEY;
  if (!appid || !key) return;
  const salt = new Date().getTime();
  const sign = MD5(appid + query + salt + key);
  return axios({
    url: "http://api.fanyi.baidu.com/api/trans/vip/translate",
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    params: {
      appid: appid,
      salt: salt,
      from: "jp",
      to: "zh",
      sign: sign,
    },
    data: `q=${encodeURIComponent(query)}`,
  }).then(function (response) {
    const obj = {};
    try {
      response.data.trans_result.forEach((i) => {
        obj[i.src.replace("$$", "\n")] = i.dst.replace("^$", "\n");
      }); // 换回替换了的换行符
    } catch (error) {
      console.log(response.data);
      return;
    }
    return obj;
  });
}

exports.baidu = baidu;
