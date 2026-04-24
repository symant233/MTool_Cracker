## MTool

由 [鬼才琪露诺](https://afdian.com/@AdventCirno) 开发的一款超赞工具。[Mtool 下载贴](https://afdian.com/p/d42dd1e234aa11eba42452540025c377) 、[release.php](https://trs.cirno.biz/release.php?lang=chs)。

> 请在 [Patreon](https://www.patreon.com/user?u=6139561) 或 [爱发电](https://afdian.com/@AdventCirno) 支持原作者。

## MTool Cracker

本地拦截处理所有请求，包括翻译功能。翻译功能在本地实现，目前实现了百度、腾讯、Ollama 本地模型接口。

你也可以自己实现其他翻译 API 的接口，欢迎提交 PR。

---

### 获取

1. `git clone` / 下载此仓储的压缩包 / 在 Release 中下载；在项目根目录下运行：

```bash
npm install # 安装依赖
```

2. 请到此处 [Release](https://github.com/symant233/MTool_Cracker/releases/tag/v1.0.0) 下载老版本的 Mtool 存档 `MTool_A10U13.7z` 或 `MTool_A10_Fix5.7z`。

### 配置

- 更改 `hosts` (`C:\Windows\System32\drivers\etc\hosts`)，添加一行：

```
127.0.0.1 trs.cirno.biz
```

- **腾讯翻译**：替换文件 `example.env` 内的 `TENCENTID` 和 `TENCENTKEY`，开通[机器翻译](https://console.cloud.tencent.com/tmt)后到[API 密钥管理](https://console.cloud.tencent.com/cam/capi)查看 `SecretId` 和 `SecretKey`。并将 `TRANSLATOR_ENGINE=tencent`。

- 百度翻译（不推荐）：替换文件 `example.env` 内的 `APPID` 和 `KEY` 为你申请的应用信息，[百度翻译开放平台](https://fanyi-api.baidu.com/manage/developer)能找到。并将 `TRANSLATOR_ENGINE=baidu`。

- **Ollama 本地模型翻译（新增）**：
  1. 安装并启动 [Ollama](https://ollama.com/)；
  2. 拉取模型，例如：`ollama pull gemma4`；
  3. 将 `TRANSLATOR_ENGINE=ollama`；
  4. 按需配置：
     - `OLLAMA_URL`（默认 `http://127.0.0.1:11434`）
     - `OLLAMA_MODEL`（默认 `gemma4`）
     - `OLLAMA_TIMEOUT`（请求超时，毫秒）
     - `OLLAMA_TEMPERATURE`（建议 `0.2`，默认兜底值 `0.5`）
  5. 项目内置为“日语 -> 简体中文”翻译，不再暴露 `from/to` 配置。
  6. 服务启动时会自动探活 Ollama 并检查目标模型是否已拉取，失败会在终端给出提示。
  7. Ollama 分页批次固定为 100 条（与主流程分页一致），不会在 Provider 内自动降温或自动拆分批次。
  8. Ollama 请求使用 `/api/generate` 单轮模式，避免会话上下文干扰批量翻译。
  9. 若某批次结构化输出持续异常，程序会自动回填该批次原文并继续，避免同一页无限重试卡死。

> 📌 替换后保存，重命名 `example.env` 文件为 `working.env`。

- 证书：进入 `certs` 文件夹，该文件夹下有一个 `mkcert-v1.4.4-xxx.exe`，如果你运行不了或者怕病毒，可以去 https://github.com/FiloSottile/mkcert/releases 下载一个。在此文件夹打开命令行（Shift+右键，打开 Powershell），然后运行下面的命令：

```bash
mkcert-v1.4.4-windows-amd64.exe trs.cirno.biz
mkcert-v1.4.4-windows-amd64.exe -install
```

> 命令会在文件夹中生成 `trs.cirno.biz.pem` 和 `trs.cirno.biz-key.pem`，代码中已经正确引用该文件名。另外在 `-install` 时会弹窗，点确定即可，这是为了 windows 能信任该证书。

### 运行服务

```bash
npm start # 先配置好再运行服务 翻译加载成功前不要关闭终端
```

服务启动完成再打开工具 `nw.exe`。

---

### 副作用

- 因为更改了 `hosts`，后续无法访问作者的网站，要访问得 _删除/注释_ 之前加入的那行。
- 未来作者可能会更改程序，所以此项目 **不一定适用** 于最新版。

### 开发

实现一个其他翻译接口的方法（DeepL，必应，Google 等...）到 `src/providers/`，接口统一为 `translateBatch(string[]): Promise<string[]>`，然后在 `working.env` 中切换 `TRANSLATOR_ENGINE`。欢迎提交 PR。

### 声明

- 此项目仅供学习使用。
- 使用此项目造成的后果由使用者自行承担。
- 不允许宣传本项目。
- 使用本项目请尽可能 [支持原作者](https://afdian.com/@AdventCirno)。
