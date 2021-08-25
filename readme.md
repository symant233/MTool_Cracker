### MTool

由 [鬼才琪露诺](https://afdian.net/@AdventCirno) 开发的一款超赞工具, [置顶下载地址](https://afdian.net/p/d42dd1e234aa11eba42452540025c377) 或 [release.php](https://trs.cirno.biz/release.php?lang=chs).

请在 [Patreon](https://www.patreon.com/user?u=6139561) 或 [爱发电](https://afdian.net/@AdventCirno) 支持原作者.

### MTool Cracker

首先这个工具做的真的很棒! 本来也想自己写一个类似的, 但仔细看了下原程序, 能兼容几乎所有主流 RPG 游戏框架 & 多种翻译接口 & 注入修改器几乎所有内容都可以修改... 要做出这种工具对我来说太难了... 就算千辛万苦造出轮子, 也不知道花了多少时间和精力了. 也可以看出工具作者对此倾注了多少心血在里面.

每次不更新不能用翻译功能非常那啥... 抓包看了下, 把 `/trsStatus.php` 的响应 download 和 allowUpload 都改成 true 就可以不更新使用翻译了. 工具做了一半发现用 Fiddler 搞个自动响应就可以了.. 但不能白费力气, 还是做完, 到时候用自己申请的翻译 API, 也不会增加原作者调用的翻译 API 费用.

不过再怎么说, 搞人家程序的 cracker 都不是什么值得炫耀的事, 先自己用着, 放私有仓库存档吧. 等过几年原作者开发出功能更多更完善的版本, 我再把这个旧版的 cracker 公开吧. (到时候估计 cracker 对最新版也没用了)

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

- 替换文件 `example.env` 内的 `APPID` 和 `KEY` 为你申请的[百度翻译开放平台](https://fanyi-api.baidu.com/manage/developer)能找到. 替换后保存, 重命名此文件为 `working.env`.

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

你也可以自己写一个其他翻译接口的方法 (DeepL, 腾讯, 必应, Google 等...) 到 `src/sdk.js`, 然后更改 `src/translator.js` 内的翻译方法为你定义的.

### LICENSE

- 不允许宣传本项目
- 使用本项目请尽可能[支持原作者](<(https://afdian.net/@AdventCirno)>)
