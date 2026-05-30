import { loadConfig } from "../service/config.mjs";
import { hashText, TranslationCache } from "../service/cache.mjs";
import { buildTranslationMessages } from "../service/prompts.mjs";

const config = loadConfig();
const cache = new TranslationCache({ enabled: false, fileCache: false });
const messages = buildTranslationMessages({ text: "Hello Discord", targetLanguage: "中文" });

if (!config.server.port) throw new Error("Missing server port");
if (!config.deepseek.model) throw new Error("Missing DeepSeek model");
if (!hashText("test")) throw new Error("Hash failed");
if (!Array.isArray(messages) || messages.length !== 2) throw new Error("Prompt build failed");
if (cache.get("x") !== undefined) throw new Error("Disabled cache failed");

console.log(JSON.stringify({
  ok: true,
  node: process.version,
  model: config.deepseek.model,
  port: config.server.port,
  mock: config.deepseek.mock,
  concurrency: config.translation.concurrency
}, null, 2));
