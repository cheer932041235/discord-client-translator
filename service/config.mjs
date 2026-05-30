import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envCache = new Map();

const defaults = {
  server: {
    host: "127.0.0.1",
    port: 3789
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    chatPath: "/v1/chat/completions",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    model: "deepseek-v4-flash",
    timeoutMs: 20000,
    temperature: 0.2,
    topP: 0.8,
    mock: false
  },
  translation: {
    targetLanguage: "中文",
    minEnglishChars: 8,
    maxChars: 2000,
    concurrency: 6,
    cache: true,
    fileCache: true
  }
};

function mergeConfig(base, override) {
  const merged = { ...base };
  for (const [key, value] of Object.entries(override || {})) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      merged[key] = mergeConfig(base[key] || {}, value);
    } else {
      merged[key] = value;
    }
  }
  return merged;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function readEnv(name) {
  if (envCache.has(name)) return envCache.get(name);
  if (process.env[name]) return process.env[name];
  if (process.platform !== "win32") {
    envCache.set(name, "");
    return "";
  }

  const escapedName = name.replaceAll("'", "''");
  for (const scope of ["User", "Machine"]) {
    try {
      const value = execFileSync("powershell.exe", [
        "-NoProfile",
        "-Command",
        `[System.Environment]::GetEnvironmentVariable('${escapedName}','${scope}')`
      ], { encoding: "utf8", windowsHide: true, timeout: 3000 }).trim();

      if (value) {
        envCache.set(name, value);
        return value;
      }
    } catch {
    }
  }

  envCache.set(name, "");
  return "";
}

export function loadConfig() {
  const configPath = resolve(ROOT, "config.json");
  const fileConfig = existsSync(configPath) ? readJson(configPath) : {};
  const config = mergeConfig(defaults, fileConfig);

  if (readEnv("DISCORD_TRANSLATOR_PORT")) {
    config.server.port = Number(readEnv("DISCORD_TRANSLATOR_PORT"));
  }
  if (readEnv("DISCORD_TRANSLATOR_HOST")) {
    config.server.host = readEnv("DISCORD_TRANSLATOR_HOST");
  }
  if (readEnv("DISCORD_TRANSLATOR_MOCK") === "1") {
    config.deepseek.mock = true;
  }
  if (readEnv("DISCORD_TRANSLATOR_CACHE") === "0") {
    config.translation.cache = false;
  }
  if (readEnv("DISCORD_TRANSLATOR_FILE_CACHE") === "0") {
    config.translation.fileCache = false;
  }
  if (readEnv("DISCORD_TRANSLATOR_DEEPSEEK_BASE_URL")) {
    config.deepseek.baseUrl = readEnv("DISCORD_TRANSLATOR_DEEPSEEK_BASE_URL");
  }
  if (readEnv("DISCORD_TRANSLATOR_MODEL")) {
    config.deepseek.model = readEnv("DISCORD_TRANSLATOR_MODEL");
  }
  if (readEnv("DISCORD_TRANSLATOR_CONCURRENCY")) {
    config.translation.concurrency = Math.max(1, Number(readEnv("DISCORD_TRANSLATOR_CONCURRENCY")) || config.translation.concurrency);
  }

  config.root = ROOT;
  config.deepseek.apiKey = readEnv(config.deepseek.apiKeyEnv);
  return config;
}
