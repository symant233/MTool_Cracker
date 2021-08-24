const fs = require("fs");
const http = require("http");
const https = require("https");
const Koa = require("koa");
const logger = require("koa-logger");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const zlib = require("zlib");
const app = new Koa();
const router = new Router();

const options = {
  key: fs.readFileSync("certs/trs.cirno.biz.key").toString(),
  cert: fs.readFileSync("certs/trs.cirno.biz.crt").toString(),
};

app.use(logger());
app.use(
  bodyParser({
    enableTypes: ["text"],
    textLimit: "10mb",
  })
);
router.get("/getMyInfo.php", (ctx) => {
  ctx.body = {
    quota: {
      usedBytes: 0,
      usedBytesRaw: 0,
      usedBytesEngine: [],
      usedBytesEngineRaw: [],
    },
    limit: {
      scramble: true,
      dataLen: 6,
      quota: 0,
      engines: ["Google"],
      quotaBytes: 0,
      dataLenBytes: 6291456,
    },
    engineMulti: {
      Google: 0,
      Baidu: 2,
      XiaoYi: 1,
      Bing: 1,
    },
    Mbyte: 1048576,
    myInfo: {
      uid: 0,
      username: "Guest",
      from: "Guest",
      activetill: 0,
      amount: 0,
      lifetime: 0,
      expired: false,
    },
  };
});
router.get("/checkUpdate.php", (ctx) => {
  ctx.body = 0;
});
router.get("/trsStatus.php", (ctx) => {
  ctx.body = {
    queue: 0,
    status: "Crack已接管, 点击开始翻译后请在命令行查看是否翻译完成...",
    download: true,
    allowUpload: true,
    trsTime: 0,
  };
});
router.get("/MvTrsAd.php", (ctx) => {
  ctx.status = 204; // 以后把原作者赞助链接补上
});
router.post("/mvTrs.php", async (ctx, next) => {
  // const id = ctx.request.query.bodyKey || "null";
  let buf = Buffer.from(ctx.request.body, "base64");
  ctx.request.body = JSON.parse(zlib.inflateSync(buf).toString("utf-8"));
  const arr = JSON.parse(ctx.request.body.realDataJsonStr);
});
router.allowedMethods({ throw: true });
app.use(router.routes());

http.createServer(app.callback()).listen(80);
https.createServer(options, app.callback()).listen(443);
