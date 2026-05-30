import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, openSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readEnv } from "../service/config.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const logsDir = resolve(root, "logs");
const outLog = resolve(logsDir, "service-real.out.log");
const errLog = resolve(logsDir, "service-real.err.log");
const pidFile = resolve(logsDir, "service-real.pid");

function stopExistingServer() {
  if (process.platform !== "win32") return;
  try {
    execFileSync("powershell.exe", [
      "-NoProfile",
      "-Command",
      "Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 3789 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
    ], { windowsHide: true });
  } catch { /* no existing server to stop */ }
}

async function waitForPortRelease() {
  for (let i = 0; i < 20; i++) {
    try {
      await fetch("http://127.0.0.1:3789/health");
    } catch {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 150));
  }
}

const key = readEnv("DEEPSEEK_API_KEY");
if (!key) {
  console.error("Missing DEEPSEEK_API_KEY. Set it in the user environment first.");
  process.exit(1);
}

mkdirSync(logsDir, { recursive: true });
stopExistingServer();
await waitForPortRelease();

const out = openSync(outLog, "a");
const err = openSync(errLog, "a");
const child = spawn(process.execPath, ["scripts/start-real-service.mjs"], {
  cwd: root,
  detached: true,
  stdio: ["ignore", out, err],
  windowsHide: true,
  env: {
    ...process.env,
    DEEPSEEK_API_KEY: key,
    DISCORD_TRANSLATOR_MOCK: "0"
  }
});

writeFileSync(pidFile, `${child.pid}\n`, "utf8");
child.unref();

let health;
for (let i = 0; i < 30; i++) {
  await new Promise(resolve => setTimeout(resolve, 300));
  try {
    health = await fetch("http://127.0.0.1:3789/health").then(res => res.json());
    if (health.ok) break;
  } catch { /* not ready yet */ }
}
if (!health || !health.ok || health.mock) {
  console.error("Service failed to start:", JSON.stringify(health || { error: "timeout" }));
  process.exit(1);
}

console.log(`discord-client-translator real service started. PID=${child.pid}, mock=${health.mock}, model=${health.model}, concurrency=${health.concurrency}`);
