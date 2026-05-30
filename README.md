# Discord Client Translator

> Vencord userplugin：自动将 Discord 英文消息翻译为中文，译文直接显示在原消息下方。

## 功能特性

- **自动翻译**：进入频道后自动翻译可见英文消息，无需手动操作
- **AI 翻译**：使用 DeepSeek API（deepseek-v4-flash），翻译质量远超机翻
- **技术社区优化**：保留 LLM、MCP、RAG、Vencord、Discord 等术语不翻译
- **智能过滤**：纯中文 / 短文本 / 链接自动跳过，不浪费 API 调用
- **内嵌显示**：译文以低干扰样式显示在原消息下方
- **操作按钮**：复制译文、重试翻译、隐藏译文
- **本地缓存**：相同内容不重复翻译
- **并发控制**：默认 6 路并发，平衡速度与 API 稳定性

## 架构

```text
Discord 消息 → Vencord 插件识别英文消息
                     ↓
              IPC 调用 (Electron net.request)
                     ↓
              DeepSeek API (deepseek-v4-flash)
                     ↓
              译文显示在原消息下方
```

插件通过 Electron IPC 在主进程中发起 API 请求，绕过渲染进程 CORS 限制。无需本地代理服务。

## 安装

### 前置条件

- Discord 桌面客户端
- [Vencord](https://vencord.dev/) development install

### 步骤

1. Clone 本仓库：

```bash
git clone https://github.com/cheer932041235/discord-client-translator.git
```

2. 将插件目录复制到 Vencord userplugins：

```bash
cp -r plugin/discordClientTranslator <VencordRepo>/src/userplugins/
```

3. 在 Vencord 仓库中重新构建：

```bash
cd <VencordRepo>
pnpm build
```

4. 重启 Discord

5. 在 Discord 设置 → Vencord → Plugins 中启用 `DiscordClientTranslator`

### 配置

插件设置中可配置：

| 设置 | 默认值 | 说明 |
|------|--------|------|
| API Key | — | DeepSeek API Key |
| API Base URL | `https://api.deepseek.com` | OpenAI 兼容端点 |
| Model | `deepseek-v4-flash` | 模型名称 |
| Auto Translate | `true` | 自动翻译开关 |
| Min English Chars | `8` | 最少英文字符才翻译 |
| Max Chars | `2000` | 超长消息跳过 |
| Concurrency | `6` | 并发翻译数 |

## 项目结构

```text
discord-client-translator/
├── plugin/discordClientTranslator/   # Vencord userplugin 源码
│   ├── index.tsx                     # 插件入口
│   ├── native.ts                     # IPC 层 (Electron net.request)
│   ├── translateClient.ts            # 翻译逻辑 + prompt
│   ├── TranslationAccessory.tsx      # 译文 UI 组件
│   ├── settings.ts                   # 插件设置
│   ├── cache.ts                      # 翻译缓存
│   ├── queue.ts                      # 并发队列
│   ├── messageFilter.ts              # 消息过滤
│   └── styles.css                    # 样式
├── service/                          # 可选：独立翻译服务 (legacy)
├── scripts/                          # 验证脚本
├── docs/                             # 设计文档
└── config.example.json               # 配置模板
```

## 安全原则

- 只做本地阅读增强，不做账号自动化
- 不读取 Discord token、cookie、密码或 2FA
- 不抓取不可见历史记录
- API Key 存储在 Vencord 插件设置中（本地）

## 开发

项目目录内出现 `@api/Settings`、`@utils/types` 等 Vencord 内部别名 lint 错误属于正常现象，真实构建在 Vencord 仓库内进行。

## License

MIT
