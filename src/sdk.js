const MD5 = require("./md5");
const axios = require("axios");
const tencentcloud = require("tencentcloud-sdk-nodejs");
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

async function tencent(arr) {
  const client = new tencentcloud.tmt.v20180321.Client({
    credential: {
      secretId: process.env.TENCENTID,
      secretKey: process.env.TENCENTKEY,
    },
    region: "ap-guangzhou",
    profile: {
      httpProfile: {
        endpoint: "tmt.tencentcloudapi.com",
      },
    },
  });
  let data = {};
  try {
    data = await client.TextTranslateBatch({
      Source: "ja",
      Target: "zh",
      ProjectId: 0,
      SourceTextList: arr,
    });
  } catch (err) {
    if (err.code == "UnsupportedOperation.TextTooLong") {
      arrL = arr.slice(0, 50);
      arrR = arr.slice(50);
      const data1 = await client.TextTranslateBatch({
        Source: "ja",
        Target: "zh",
        ProjectId: 0,
        SourceTextList: arrL,
      });
      const data2 = await client.TextTranslateBatch({
        Source: "ja",
        Target: "zh",
        ProjectId: 0,
        SourceTextList: arrR,
      });
      data.TargetTextList = data1.TargetTextList.concat(data2.TargetTextList);
    } else {
      console.log(err);
    }
  }

  return data.TargetTextList;
}

module.exports = { baidu, tencent };
