const fs = require("fs");
const http = require("http");
const https = require("https");
const Koa = require("koa");
const logger = require("koa-logger");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const config = require("./config");
const { resolveTranslator } = require("./translator");
const { registerMtoolRoutes } = require("./routes/mtoolRoutes");
const { runOllamaStartupProbe } = require("./services/ollamaProbe");

const translatorInfo = resolveTranslator(config.translatorEngine);
const selectedEngine = translatorInfo.selected;
const translator = translatorInfo.translator;
if (translatorInfo.fallback) {
  console.warn(
    `未识别的 TRANSLATOR_ENGINE=${config.translatorEngine}，已回退到 ${selectedEngine}`
  );
}

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

registerMtoolRoutes(router, { translator, selectedEngine });

router.allowedMethods({ throw: true });
app.use(router.routes());

http.createServer(app.callback()).listen(80);
https.createServer(options, app.callback()).listen(443);

console.log("服务已启动，在翻译完成前请勿关闭...");
console.log(`当前翻译引擎: ${selectedEngine}`);
runOllamaStartupProbe(selectedEngine);
