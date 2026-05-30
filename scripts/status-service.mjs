import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const pidFile = resolve("logs", "service-real.pid");
const pid = existsSync(pidFile) ? readFileSync(pidFile, "utf8").trim() : "";

try {
  const health = await fetch("http://127.0.0.1:3789/health").then(res => res.json());
  console.log(JSON.stringify({
    ok: Boolean(health.ok),
    running: true,
    pid: pid || undefined,
    mock: Boolean(health.mock),
    model: health.model,
    cache: Boolean(health.cache),
    concurrency: health.concurrency
  }, null, 2));
  if (!health.ok || health.mock) process.exitCode = 1;
} catch (error) {
  console.log(JSON.stringify({
    ok: false,
    running: false,
    pid: pid || undefined,
    error: error.message || String(error)
  }, null, 2));
  process.exitCode = 1;
}
