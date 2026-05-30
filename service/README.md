# Translation Service

本地翻译服务负责隔离 DeepSeek API Key，并向 Discord 客户端插件暴露 localhost 接口。

## 启动

```powershell
npm run service
```

Mock 模式：

```powershell
npm run service:mock
```

## 环境变量

```powershell
$env:DEEPSEEK_API_KEY="sk-..."
```

## 接口

```http
GET http://127.0.0.1:3789/health
POST http://127.0.0.1:3789/translate
```

`POST /translate` 请求：

```json
{
  "text": "Can you keep updating the SWE model?"
}
```

响应：

```json
{
  "ok": true,
  "translated": "你能继续更新 SWE 模型吗？",
  "cached": false,
  "model": "deepseek-v4-flash"
}
```
