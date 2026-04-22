const tencentcloud = require("tencentcloud-sdk-nodejs");

function createTencentClient() {
  return new tencentcloud.tmt.v20180321.Client({
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
}

async function translateBatch(textList) {
  if (!Array.isArray(textList) || textList.length === 0) {
    return [];
  }

  const client = createTencentClient();
  try {
    const data = await client.TextTranslateBatch({
      Source: "ja",
      Target: "zh",
      ProjectId: 0,
      SourceTextList: textList,
    });
    return data.TargetTextList;
  } catch (error) {
    if (error.code !== "UnsupportedOperation.TextTooLong") {
      throw error;
    }

    const left = textList.slice(0, 50);
    const right = textList.slice(50);
    const leftData = await client.TextTranslateBatch({
      Source: "ja",
      Target: "zh",
      ProjectId: 0,
      SourceTextList: left,
    });
    const rightData = await client.TextTranslateBatch({
      Source: "ja",
      Target: "zh",
      ProjectId: 0,
      SourceTextList: right,
    });
    return leftData.TargetTextList.concat(rightData.TargetTextList);
  }
}

module.exports = {
  translateBatch,
};
