import { buildTranslationMessages } from "./prompts.mjs";

function buildChatUrl(config) {
  const baseUrl = config.deepseek.baseUrl.replace(/\/+$/, "");
  const path = config.deepseek.chatPath || "/chat/completions";
  if (baseUrl.endsWith("/chat/completions")) return baseUrl;
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function translateWithDeepSeek(text, config) {
  if (config.deepseek.mock) {
    const mockMap = {
      en: "（mock）这是一条模拟翻译，真实翻译需要配置 DEEPSEEK_API_KEY。",
    };
    return {
      text: mockMap.en,
      model: config.deepseek.model,
      mock: true
    };
  }

  if (!config.deepseek.apiKey) {
    const error = new Error(`Missing ${config.deepseek.apiKeyEnv}`);
    error.code = "missing_api_key";
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.deepseek.timeoutMs);

  try {
    const response = await fetch(buildChatUrl(config), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.deepseek.apiKey}`
      },
      body: JSON.stringify({
        model: config.deepseek.model,
        messages: buildTranslationMessages({
          text,
          targetLanguage: config.translation.targetLanguage
        }),
        temperature: config.deepseek.temperature,
        top_p: config.deepseek.topP,
        stream: false
      }),
      signal: controller.signal
    });

    const body = await response.text();
    if (!response.ok) {
      const error = new Error(classifyDeepSeekError(response.status, body));
      error.status = response.status;
      error.body = body;
      throw error;
    }

    const data = JSON.parse(body);
    const translated = data?.choices?.[0]?.message?.content || "";
    return {
      text: translated.replace(/\[NEWLINE\]/g, "\n").trim(),
      model: config.deepseek.model,
      mock: false
    };
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("DeepSeek API timeout");
      timeoutError.code = "timeout";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function classifyDeepSeekError(status, body = "") {
  if (status === 401 || status === 403) return "DeepSeek API key invalid or unauthorized";
  if (status === 429) return "DeepSeek API rate limit or quota exceeded";
  if (status >= 500) return "DeepSeek API server error";
  return `DeepSeek API error ${status}: ${String(body).slice(0, 300)}`;
}
