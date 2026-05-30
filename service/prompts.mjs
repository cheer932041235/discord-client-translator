export function buildTranslationMessages({ text, targetLanguage }) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\n/g, " [NEWLINE] ");

  return [
    {
      role: "system",
      content: "你是面向中文开发者的 Discord AI 技术社区消息翻译器，目标是帮助用户快速理解英文讨论。"
    },
    {
      role: "user",
      content: [
        `请把下面 Discord 技术社区消息翻译成${targetLanguage}，优先保证读者能快速理解原意。`,
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
