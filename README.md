# Discord Client Translator

> 本地 Discord 客户端翻译注入工具：在 Discord 桌面客户端消息下方显示中文译文，翻译后端走 DeepSeek 官方 API。

## 项目定位

这个项目用于解决 Discord AI 社群阅读门槛问题：用户在 Discord 桌面客户端中浏览英文 AI 技术社区时，工具自动或半自动把可见英文消息翻译成中文，并以内嵌 UI 形式显示在原消息下方。

核心原则：

- 只做本地阅读增强，不做账号自动化。
- 只处理当前客户端可见消息，不抓取不可见历史记录。
- 不读取、不导出、不使用 Discord token、cookie、密码或 2FA 信息。
- API Key 不写入客户端插件，由本地翻译服务从环境变量读取。
- 默认服务用户个人观察号场景，后续再考虑开源化。

## 当前阶段

当前 MVP 已完成 Discord 桌面客户端实机验证：Vencord userplugin 可以在英文消息下方渲染中文译文，本地翻译服务已接通 DeepSeek 官方 API。当前产品边界聚焦“帮助用户理解英文 Discord 消息”，暂不开发社区分享、情报沉淀或 Obsidian 联动等扩展能力。

- 需求文档：`需求文档.md`
- 待开发文档：`待开发文档.md`
- 源码拆解：`docs/源码拆解与参考.md`
- 进展记录：`进展.md`

## 建议目录结构

```text
discord-client-translator/
├── README.md
├── 需求文档.md
├── 待开发文档.md
├── 进展.md
├── plugin/                 # Vencord userplugin 源码模板
├── service/                # 本地翻译代理服务
├── scripts/                # 本地检查与 smoke test
├── docs/                   # 设计决策、调研记录、截图说明
├── config.example.json     # 配置模板
└── .gitignore              # 敏感配置与缓存排除
```

## 推荐技术路线草案

```text
Vencord 插件
        ↓
监听/识别当前频道可见消息
        ↓
调用 localhost 本地翻译服务
        ↓
本地服务调用 DeepSeek 官方 API，默认 deepseek-v4-flash
        ↓
返回中文译文
        ↓
插件把译文插入到原消息下方
```

## 已确认方向

- 项目路径为 `knowledge-base/tools/discord-client-translator/`。
- 插件基座优先尝试 Vencord，BetterDiscord 作为备选。
- API 上游使用 DeepSeek 官方 API。
- MVP 默认自动翻译当前可见消息。
- 当前体验优化只围绕翻译理解：技术术语保留、自然中文表达、复制译文、重试翻译、隐藏译文。
- 混合社群中采用轻量过滤：纯中文或中文为主的消息会跳过；英文字符达到阈值且英文占主导的消息才翻译。
- 允许本地缓存翻译结果。
- Obsidian 联动暂不开发，后续列入待办。

## 本地服务验证

```powershell
npm run check
npm run test:mock
npm run smoke:http
```

当前已通过：

- `npm run check`：配置、prompt、缓存基础检查。
- `npm run test:mock`：DeepSeek 客户端 mock 翻译检查。
- `npm run smoke:http`：自动启动 mock HTTP 服务并验证 `/health`、`/translate`。
- `npm run check:key`：确认当前进程可读取 `DEEPSEEK_API_KEY`。
- `npm run test:real`：DeepSeek 官方 API 真实单句翻译检查。
- `npm run smoke:real`：本地 HTTP 服务通过 `/translate` 调用 DeepSeek 真实翻译检查。

## 启动本地翻译服务

Mock 模式：

```powershell
npm run service:mock
```

真实 DeepSeek 模式：

```powershell
npm run service:real:bg
```

服务状态与停止：

```powershell
npm run service:status
npm run service:stop
```

真实 API 验证：

```powershell
npm run check:key
npm run test:real
npm run smoke:real
```

说明：

- `check:key` 会检查当前进程环境变量；在 Windows 下当前进程没有时，会回退读取用户/机器环境变量，不会打印密钥内容。
- `service:real`、`service:real:bg`、`smoke:real` 都复用同一套环境变量读取逻辑。
- `service:real:bg` 从环境变量读取 `DEEPSEEK_API_KEY`，后台启动真实翻译服务，并写入 `logs/service-real.pid`。
- `service:status` 返回 `mock: false` 才代表当前 Discord 插件使用的是真实 DeepSeek 翻译。
- 默认并发为 `6`，兼顾一屏多条英文消息的翻译速度和 API 稳定性；如遇到限流，可设置 `DISCORD_TRANSLATOR_CONCURRENCY` 临时下调服务端并发。
- DeepSeek 单条 Discord 消息成本较低，当前不做复杂预算面板；依靠可见消息触发、中文过滤、缓存、并发限制控制成本。
- `test:real` 直接调用 DeepSeek 官方 API 测试单句翻译。
- `smoke:real` 启动本地 HTTP 服务后，通过 `/translate` 间接调用 DeepSeek。
- 如果未设置 `DEEPSEEK_API_KEY`，`check:key` / `smoke:real` 会安全失败，不会发起外部请求。

服务默认地址：

```text
http://127.0.0.1:3789
```

## Vencord 插件模板

插件源码位于：

```text
plugin/discordClientTranslator
```

准备好 Vencord development install 后，将该目录复制或链接到：

```text
<VencordRepo>/src/userplugins/discordClientTranslator
```

当前项目目录内出现 `@api/Settings`、`@utils/types` 等 Vencord 内部别名提示时属于正常现象；真实构建应在 Vencord 仓库内进行。
