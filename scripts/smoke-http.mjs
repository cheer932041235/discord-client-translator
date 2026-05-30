import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { readEnv } from "../service/config.mjs";

const root = resolve(import.meta.dirname, "..");
const realMode = process.argv.includes("--real");
const port = realMode ? "3791" : "3790";

const key = readEnv("DEEPSEEK_API_KEY");
if (realMode && !key) {
  console.error("Missing DEEPSEEK_API_KEY. Set it in the current shell before running npm run smoke:real.");
  process.exit(1);
}

const child = spawn(process.execPath, ["service/server.mjs"], {
  cwd: root,
  env: {
    ...process.env,
    DEEPSEEK_API_KEY: key,
    DISCORD_TRANSLATOR_MOCK: realMode ? "0" : "1",
    DISCORD_TRANSLATOR_PORT: port,
    DISCORD_TRANSLATOR_FILE_CACHE: "0"
  },
  stdio: ["ignore", "pipe", "pipe"]
});

let output = "";
child.stdout.on("data", chunk => {
  output += chunk.toString();
});
child.stderr.on("data", chunk => {
  output += chunk.toString();
});

try {
  await waitForServer(`http://127.0.0.1:${port}/health`);

  const health = await fetch(`http://127.0.0.1:${port}/health`).then(r => r.json());
  const translation = await fetch(`http://127.0.0.1:${port}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Can you keep updating the SWE model?" })
  }).then(r => r.json());

  if (!health.ok) throw new Error("Health check failed");
  if (!translation.ok || !translation.translated) {
    throw new Error(`Translate check failed: ${JSON.stringify(translation)}`);
  }

  console.log(JSON.stringify({ ok: true, mode: realMode ? "real" : "mock", health, translation }, null, 2));
} finally {
  child.kill();
}

async function waitForServer(url) {
  const started = Date.now();
  while (Date.now() - started < 5000) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not start. Output: ${output}`);
}
