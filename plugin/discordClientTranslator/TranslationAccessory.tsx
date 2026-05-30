import type { Message } from "@vencord/discord-types";
import { useEffect, useState } from "@webpack/common";

import { getMessageContent, shouldTranslateMessage } from "./messageFilter";
import { enqueue } from "./queue";
import { settings } from "./settings";
import { translateText } from "./translateClient";
import type { TranslationState } from "./types";

let renderLogCount = 0;

export function TranslationAccessory({ message }: { message: Message; }) {
  const [state, setState] = useState<TranslationState>({ status: "idle" });
  const [copied, setCopied] = useState(false);
  const autoTranslate = settings.use(["autoTranslate"]).autoTranslate;
  const content = getMessageContent(message);

  function canTranslate() {
    if ((message as any).vencordEmbeddedBy) return false;
    return shouldTranslateMessage(content, {
      minEnglishChars: settings.store.minEnglishChars,
      maxChars: settings.store.maxChars
    });
  }

  function startTranslation(force = false, isAlive = () => true) {
    if (!canTranslate()) return;

    if (settings.store.showLoading || force) {
      setState({ status: force ? "translating" : "queued" });
    }

    enqueue(async () => {
      if (isAlive() && (settings.store.showLoading || force)) setState({ status: "translating" });
      return translateText(content, { force });
    }, () => settings.store.concurrency)
      .then(result => {
        if (!isAlive()) return;
        if (!result.text) return setState({ status: "idle" });
        setState({
          status: "translated",
          text: result.text,
          cached: result.cached,
          model: result.model
        });
      })
      .catch(error => {
        if (!isAlive()) return;
        console.warn("[DiscordClientTranslator] translate failed", {
          messageId: message.id,
          error: error?.message || String(error)
        });
        setState({ status: "failed", error: error?.message || String(error) });
      });
  }

  async function copyTranslation(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  useEffect(() => {
    let alive = true;

    if (renderLogCount < 20) {
      renderLogCount++;
      console.info("[DiscordClientTranslator] accessory", {
        messageId: message.id,
        contentLength: content.length,
        autoTranslate
      });
    }

    if (!autoTranslate) return;
    startTranslation(false, () => alive);

    return () => {
      alive = false;
    };
  }, [message.id, autoTranslate]);

  if (state.status === "queued" && settings.store.showLoading) {
    return <span className="dct-accessory dct-muted">译文排队中...</span>;
  }

  if (state.status === "translating" && settings.store.showLoading) {
    return <span className="dct-accessory dct-muted">正在翻译...</span>;
  }

  if (state.status === "failed" && settings.store.showFailures) {
    return (
      <span className="dct-accessory dct-error">
        <span>翻译失败：{state.error}</span>
        <span className="dct-actions">
          <button className="dct-action" onClick={() => startTranslation(true)}>重试</button>
          <button className="dct-action" onClick={() => setState({ status: "idle" })}>隐藏</button>
        </span>
      </span>
    );
  }

  if (state.status !== "translated") return null;
  const translatedText = state.text;

  return (
    <span className="dct-accessory">
      <span className="dct-label">译</span>
      <span className="dct-text">{translatedText}</span>
      <span className="dct-actions">
        <button className="dct-action" onClick={() => void copyTranslation(translatedText)}>{copied ? "已复制" : "复制"}</button>
        <button className="dct-action" onClick={() => startTranslation(true)}>重试</button>
        <button className="dct-action" onClick={() => setState({ status: "idle" })}>隐藏</button>
      </span>
    </span>
  );
}
