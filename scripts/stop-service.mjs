import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const pidFile = resolve("logs", "service-real.pid");
const pid = existsSync(pidFile) ? Number(readFileSync(pidFile, "utf8").trim()) : 0;

if (!pid) {
  console.log("discord-client-translator service pid file not found.");
  process.exit(0);
}

try {
  if (process.platform === "win32") {
    execFileSync("powershell.exe", ["-NoProfile", "-Command", `Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue`], { windowsHide: true });
  } else {
    process.kill(pid, "SIGTERM");
  }
  rmSync(pidFile, { force: true });
  console.log(`discord-client-translator service stopped. PID=${pid}`);
} catch (error) {
  console.error(error.message || String(error));
  process.exitCode = 1;
}
