import { loadConfig } from "../service/config.mjs";
import { translateWithDeepSeek } from "../service/deepseek-client.mjs";

const config = loadConfig();
if (process.argv.includes("--mock")) config.deepseek.mock = true;

const result = await translateWithDeepSeek("Can you keep updating the SWE model?", config);
console.log(JSON.stringify({ ok: true, result }, null, 2));
