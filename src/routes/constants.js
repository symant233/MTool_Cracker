const TRS_STATUS = {
  queue: 0,
  status: "Cracker已接管, 点击开始翻译后请在命令行查看是否翻译完成...",
  download: true,
  allowUpload: true,
  trsTime: 0,
};

const MY_INFO = {
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

const PENDING_TIP = "请在终端查看是否翻译完成!";
const RELEASE_BLOCKED_TIP = "请求被 cracker 拦截了, 取消 hosts 的更改才可访问!";

module.exports = {
  MY_INFO,
  PENDING_TIP,
  RELEASE_BLOCKED_TIP,
  TRS_STATUS,
};
