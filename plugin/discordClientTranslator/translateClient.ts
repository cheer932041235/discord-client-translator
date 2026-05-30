import { PluginNative } from "@utils/types";

import { clearCachedTranslation, getCachedTranslation, getInflightTranslation, hashText, setCachedTranslation, setInflightTranslation } from "./cache";
import { settings } from "./settings";
import type { TranslationResult } from "./types";

const Native = VencordNative.pluginHelpers.DiscordClientTranslator as PluginNative<typeof import("./native")>;

export function translateText(text: string, options?: { force?: boolean; }) {
  const hash = hashText(text);
  if (options?.force) {
    clearCachedTranslation(hash);
  } else {
    const cached = getCachedTranslation(hash);
    if (cached) return Promise.resolve({ ...cached, cached: true });

    const inflight = getInflightTranslation(hash);
    if (inflight) return inflight;
  }

  const promise = requestTranslation(text).then(result => {
    setCachedTranslation(hash, result);
    return result;
  });
  setInflightTranslation(hash, promise);
  return promise;
}

function buildMessages(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\n/g, " [NEWLINE] ");
  return [
    {
      role: "system",
      content: "你是面向中文开发者的 Discord AI 技术社区消息翻译器，目标是帮助用户快速理解英文讨论。"
    },
    {
      role: "user",
      content: [
        "请把下面 Discord 技术社区消息翻译成中文，优先保证读者能快速理解原意。",
        "要求：",
        "1. 只输出译文，不要解释。",
        "2. 保留常见技术名词和产品名，如 Windsurf、Cascade、Vencord、Discord、MCP、SWE-bench、RAG、LLM、agent、repo、PR、issue。",
        "3. 保留代码、命令、URL、用户名、频道名。",
        "4. 语气贴近日常技术社区，不要过度书面；短句、口语、省略表达要译成自然中文。",
        "5. 如果原文已经是中文或不需要翻译，返回空字符串。",
        "6. 将 [NEWLINE] 标记还原为真实换行，不要原样显示。",
        "",
        "消息：",
        normalized
      ].join("\n")
    }
  ];
}

async function requestTranslation(text: string): Promise<TranslationResult> {
  const apiKey = settings.store.apiKey;
  if (!apiKey) {
    throw new Error("未设置 API Key，请在插件设置中填写 DeepSeek API Key");
  }

  const baseUrl = settings.store.apiBaseUrl.replace(/\/+$/, "");
  const model = settings.store.model || "deepseek-v4-flash";

  const { status, data } = await Native.makeTranslateRequest(
    baseUrl,
    apiKey,
    JSON.stringify({
      model,
      messages: buildMessages(text),
      temperature: 0.2,
      top_p: 0.8,
      max_tokens: 2048
    })
  );

  if (status === -1) {
    throw new Error(`网络错误: ${data}`);
  }

  if (status !== 200) {
    throw new Error(`API ${status}: ${data.slice(0, 200)}`);
  }

  const parsed = JSON.parse(data);
  const translated = parsed?.choices?.[0]?.message?.content?.trim() || "";

  return {
    text: translated,
    cached: false,
    model
  };
}
