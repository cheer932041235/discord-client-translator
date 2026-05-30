# Vencord UserPlugin

本目录保存 `DiscordClientTranslator` 的 Vencord userplugin 源码模板。

## 安装位置

准备好 Vencord development install 后，将以下目录复制或链接到：

```text
<VencordRepo>/src/userplugins/discordClientTranslator
```

源目录：

```text
plugin/discordClientTranslator
```

## 验证目标

第一阶段只验证：

- 插件能出现在 Vencord 插件列表。
- `renderMessageAccessory` 能在 Discord 消息下方渲染内容。
- accessory 能拿到 `message.id` 和 `message.content`。
- 插件能访问 `http://127.0.0.1:3789/translate`。

## 注意

当前项目目录单独打开时，TypeScript 会提示找不到 `@api/Settings`、`@utils/types`、`@vencord/discord-types` 等模块。这是正常的，因为这些别名由 Vencord 仓库构建系统提供。
