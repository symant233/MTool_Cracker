### MTool

由 [鬼才琪露诺](https://afdian.net/@AdventCirno) 开发的一款超赞工具, [置顶下载贴](https://afdian.net/p/d42dd1e234aa11eba42452540025c377) 或 [release.php](https://trs.cirno.biz/release.php?lang=chs).

请在 [Patreon](https://www.patreon.com/user?u=6139561) 或 [爱发电](https://afdian.net/@AdventCirno) 支持原作者.

### MTool Cracker

本地拦截处理所有请求, 包括翻译功能. 翻译功能在本地实现, 目前实现了百度、腾讯翻译的接口.

你也可以自己实现其他翻译 API 的接口, 欢迎提交 PR.

---

### 获取

`git clone` / 下载此仓储的压缩包 / 在 Release 中下载; 在项目根目录下运行:

```bash
npm install # 安装依赖
```

### 配置

- 更改 `hosts` (`C:\Windows\System32\drivers\etc\hosts`), 添加一行:

```
127.0.0.1 trs.cirno.biz
```

- 替换文件 `example.env` 内的 `APPID` 和 `KEY` 为你申请的应用信息, [百度翻译开放平台](https://fanyi-api.baidu.com/manage/developer)能找到. 替换后保存, 重命名此文件为 `working.env`. / 使用**腾讯翻译**则为 `TENCENTID` 和 `TENCENTKEY`（强烈建议用腾讯翻译，开通[机器翻译](https://console.cloud.tencent.com/tmt)后到[API密钥管理](https://console.cloud.tencent.com/cam/capi)查看`SecretId`和`SecretKey`）.

- 安装 `certs/trs.cirno.biz.crt` 到 `个人` (双击打开->安装证书->存储位置:当前用户->将所有的证书都放入下列存储:个人->完成). 你也可以用[此项目](https://github.com/kingkool68/generate-ssl-certs-for-local-development)自己生成.

### 运行服务

```bash
npm start   # 先配置好再运行服务
```

服务启动完成打开工具 `nw.exe`.

首次使用此项目时, 由于使用了自签证书, 请求会失败 (更新那里会显示 Failed to fetch). 在工具里右键空白处点击检查, 在 `Console` 标签页会显示红色的报错, 点链接, 选显示更多继续访问. 之后只要不再换证书就不会再请求失败了.

---

### 副作用

- 因为更改了 `hosts`, 后续无法访问作者的网站, 要访问得 _删除/注释_ 之前加入的那行.
- 未来作者可能会更改程序, 所以此项目 **不一定适用** 于最新版.

### 开发

你也可以自己写一个其他翻译接口的方法 (DeepL, 必应, Google 等...) 到 `src/sdk.js`, 然后更改 `src/translator.js` 内的翻译方法为你定义的.

### 声明

- 此项目仅供学习使用
- 使用此项目造成的后果由使用者自行承担
- 不允许宣传本项目
- 使用本项目请尽可能 [支持原作者](https://afdian.net/@AdventCirno)
