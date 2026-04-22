const fs = require("fs");
const zlib = require("zlib");
const {
  MY_INFO,
  PENDING_TIP,
  RELEASE_BLOCKED_TIP,
  TRS_STATUS,
} = require("./constants");

function parseCompressedRequestBody(rawBody) {
  const buf = Buffer.from(rawBody, "base64");
  return JSON.parse(zlib.inflateSync(buf).toString("utf-8"));
}

function readTranslatedFile(id) {
  if (!fs.existsSync(`dist/${id}.json`)) {
    return null;
  }
  const data = JSON.parse(fs.readFileSync(`dist/${id}.json`, "utf8"));
  data.data = JSON.stringify(data.data);
  return data;
}

function registerMtoolRoutes(router, { translator, selectedEngine }) {
  router.get("/checkUpdate.php", (ctx) => {
    ctx.body = 0;
  });

  router.get("/trsStatus.php", (ctx) => {
    ctx.body = TRS_STATUS;
  });

  router.get("/MvTrsAd.php", (ctx) => {
    ctx.body = `<span style='color:red;'>
  [cracker] 当前选择 "${selectedEngine}" 翻译, 在 working.env 的 TRANSLATOR_ENGINE 中更改。
  </span>`;
  });

  router.post("/mvTrs.php", async (ctx) => {
    const id = ctx.request.query.bodyKey || "null";
    ctx.request.body = parseCompressedRequestBody(ctx.request.body);
    translator(id, ctx.request.body);
    ctx.body = `ok 0 ${id}`;
  });

  router.get("/trsGet.php", (ctx) => {
    const id = ctx.request.query.bodyKey || "null";
    const data = readTranslatedFile(id);
    if (!data) {
      ctx.body = PENDING_TIP;
      return;
    }
    ctx.body = JSON.stringify(data);
  });

  router.get("/release.php", (ctx) => {
    ctx.body = RELEASE_BLOCKED_TIP;
  });

  router.get("/getMyInfo.php", (ctx) => {
    ctx.body = MY_INFO;
  });
}

module.exports = {
  registerMtoolRoutes,
};
