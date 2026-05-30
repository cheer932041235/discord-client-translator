import { loadConfig } from "../service/config.mjs";

const config = loadConfig();
const key = config.deepseek.apiKey;

console.log(JSON.stringify({
  ok: Boolean(key),
  env: config.deepseek.apiKeyEnv,
  present: Boolean(key),
  model: config.deepseek.model,
  baseUrl: config.deepseek.baseUrl,
  message: key ? "DeepSeek API key is present" : `Missing ${config.deepseek.apiKeyEnv}`
}, null, 2));

if (!key) process.exitCode = 1;
