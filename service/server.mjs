import { createServer } from "node:http";
import { loadConfig } from "./config.mjs";
import { hashText, TranslationCache } from "./cache.mjs";
import { translateWithDeepSeek } from "./deepseek-client.mjs";
import { AsyncQueue } from "./queue.mjs";

const config = loadConfig();
const cache = new TranslationCache({
  enabled: config.translation.cache,
  fileCache: config.translation.fileCache
});
const queue = new AsyncQueue(config.translation.concurrency);

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if (size > 1024 * 1024) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8") || "{}";
        resolve(JSON.parse(text));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function validateText(text) {
  if (typeof text !== "string" || !text.trim()) return "Missing text";
  if (text.length > config.translation.maxChars) return `Text too long, max ${config.translation.maxChars} chars`;
  return "";
}

async function handleTranslate(req, res) {
  try {
    const body = await readJson(req);
    const text = String(body.text || "").trim();
    const validationError = validateText(text);
    if (validationError) return sendJson(res, 400, { ok: false, error: validationError });

    const hash = body.hash || hashText(text);
    const cached = cache.get(hash);
    if (cached) {
      return sendJson(res, 200, {
        ok: true,
        translated: cached.translated,
        cached: true,
        model: cached.model || config.deepseek.model
      });
    }

    const result = await queue.run(() => translateWithDeepSeek(text, config));
    cache.set(hash, result.text, { model: result.model });

    return sendJson(res, 200, {
      ok: true,
      translated: result.text,
      cached: false,
      model: result.model,
      mock: result.mock
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: error.message || String(error),
      code: error.code,
      status: error.status
    });
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);

  if (req.method === "OPTIONS") return sendJson(res, 204, {});

  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, {
      ok: true,
      service: "discord-client-translator",
      model: config.deepseek.model,
      mock: Boolean(config.deepseek.mock),
      cache: Boolean(config.translation.cache),
      concurrency: config.translation.concurrency
    });
  }

  if (req.method === "POST" && url.pathname === "/translate") {
    return handleTranslate(req, res);
  }

  return sendJson(res, 404, { ok: false, error: "Not found" });
});

server.listen(config.server.port, config.server.host, () => {
  console.log(`discord-client-translator service listening on http://${config.server.host}:${config.server.port}`);
});
