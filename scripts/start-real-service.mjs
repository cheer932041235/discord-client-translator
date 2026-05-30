import { readEnv } from "../service/config.mjs";

process.env.DISCORD_TRANSLATOR_MOCK = "0";

const key = readEnv("DEEPSEEK_API_KEY");
if (!key) {
  console.error("Missing DEEPSEEK_API_KEY. Set it in the user environment before starting real translation service.");
  process.exit(1);
}

process.env.DEEPSEEK_API_KEY = key;

await import("../service/server.mjs");
