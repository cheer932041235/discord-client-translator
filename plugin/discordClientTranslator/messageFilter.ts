import type { Message } from "@vencord/discord-types";

export function getMessageContent(message: Message) {
  const snapshots = (message as any).messageSnapshots;
  const embedded = (message as any).embeds?.find?.((embed: any) => embed?.type === "auto_moderation_message")?.rawDescription;
  return String(message.content || snapshots?.[0]?.message?.content || embedded || "").trim();
}

export function shouldTranslateMessage(text: string, options: { minEnglishChars: number; maxChars: number; }) {
  if (!text) return false;
  if (text.length > options.maxChars) return false;
  if (isPureUrl(text)) return false;
  if (isMostlyCode(text)) return false;

  const englishCount = (text.match(/[A-Za-z]/g) || []).length;
  if (englishCount < options.minEnglishChars) return false;

  const chineseCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  if (chineseCount > 0 && chineseCount >= englishCount) return false;

  return true;
}

function isPureUrl(text: string) {
  return /^https?:\/\/\S+$/i.test(text.trim());
}

function isMostlyCode(text: string) {
  const codeSignals = ["```", "function ", "const ", "let ", "import ", "export ", "npm ", "pnpm ", "git "];
  const hits = codeSignals.filter(signal => text.includes(signal)).length;
  if (text.includes("```")) return true;
  return hits >= 3;
}
