const fs = require("fs");
const http = require("http");
const https = require("https");
const Koa = require("koa");
const logger = require("koa-logger");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const zlib = require("zlib");
// 导入的翻译引擎接口方法
const { trsBaidu, trsTencent, trsGemini } = require("./translator");

const translator = trsGemini; // ! 在此更改为想要的翻译引擎

const app = new Koa();
const router = new Router();

const options = {
  key: fs.readFileSync("certs/trs.cirno.biz-key.pem").toString(),
  cert: fs.readFileSync("certs/trs.cirno.biz.pem").toString(),
};

app.use(logger());
app.use(
  bodyParser({
    enableTypes: ["text"],
    textLimit: "10mb",
  })
);

router.get("/checkUpdate.php", (ctx) => {
  ctx.body = 0;
});
router.get("/trsStatus.php", (ctx) => {
  ctx.body = {
    queue: 0,
    status: "Cracker已接管, 点击开始翻译后请在命令行查看是否翻译完成...",
    download: true,
    allowUpload: true,
    trsTime: 0,
  };
});
router.get("/MvTrsAd.php", (ctx) => {
  ctx.body = `<span style='color:red;'>
  [cracker] 当前选择 "${translator.name}" 翻译, 在 index.js 中更改。
  </span>`;
});
router.post("/mvTrs.php", async (ctx) => {
  const id = ctx.request.query.bodyKey || "null";
  let buf = Buffer.from(ctx.request.body, "base64");
  ctx.request.body = JSON.parse(zlib.inflateSync(buf).toString("utf-8"));
  translator(id, ctx.request.body);
  ctx.body = `ok 0 ${id}`;
});
router.get("/trsGet.php", (ctx) => {
  const id = ctx.request.query.bodyKey || "null";
  if (!fs.existsSync(`dist/${id}.json`)) {
    ctx.body = "请在终端查看是否翻译完成!";
    return;
  }
  const data = JSON.parse(fs.readFileSync(`dist/${id}.json`, "utf8"));
  data.data = JSON.stringify(data.data);
  ctx.body = JSON.stringify(data);
});
router.get("/release.php", (ctx) => {
  ctx.body = "请求被 cracker 拦截了, 取消 hosts 的更改才可访问!";
});
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
      dataLen: 10,
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
      username: "Cracker",
      from: "Cracker",
      activetill: 0,
      amount: 0,
      lifetime: 0,
      expired: false,
    },
  };
});

router.allowedMethods({ throw: true });
app.use(router.routes());

http.createServer(app.callback()).listen(80);
https.createServer(options, app.callback()).listen(443);

console.log("服务已启动，在翻译完成前请勿关闭...");
