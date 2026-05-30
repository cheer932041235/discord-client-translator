# Vencord 实机调试日志`n

## 2026-05-20 06:56:45 用户反馈
- Discord 可打开，但 DiscordClientTranslator 插件没有正确显示译文。
- 目标：持续定位修复，所有操作写日志，保证可回滚。


## 2026-05-20 12:42:52 构建验证
- 修复：插件内部设置 enabled -> autoTranslate，避免与 Vencord 插件总开关冲突。
- 修复：showLoading/showFailures 默认 true，便于实机看到失败原因。
- 插桩：start/accessory/translate failed 写入 Discord renderer console。
- Vencord build: 0。
- Vencord testTsc: 0。


## 2026-05-20 12:58:45 继续执行
- 用户要求继续。
- 下一步：检查残留 Node 进程，使用 8GB Node heap 重跑 Vencord testTsc。


## 2026-05-20 13:18:15 重新注入前状态
- testTsc: 0。
- 开始关闭 Discord、注入 Vencord、写入 DiscordClientTranslator 配置。

- Installer exit: 0。
- Settings written: C:\Users\Administrator\AppData\Roaming\Vencord\settings\settings.json。

- Discord process count: 6。
- Renderer log last write: 05/20/2026 13:19:00。


## 2026-05-20 13:20:27 修正注入方式
- 根因判断：直接 Installer -branch stable 会加载官方 stable，不加载本地 userplugin bundle。
- 改为设置 VENCORD_DEV_INSTALL=1 与 VENCORD_USER_DATA_DIR=E:\study\vencord-dev\Vencord 后执行 -install。

- Dev installer exit: -1。

