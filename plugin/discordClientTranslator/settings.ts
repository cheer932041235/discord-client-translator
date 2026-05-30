import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
  autoTranslate: {
    type: OptionType.BOOLEAN,
    description: "Automatically translate visible received messages",
    default: true
  },
  apiKey: {
    type: OptionType.STRING,
    description: "DeepSeek API Key",
    default: ""
  },
  apiBaseUrl: {
    type: OptionType.STRING,
    description: "API base URL (OpenAI-compatible)",
    default: "https://api.deepseek.com"
  },
  model: {
    type: OptionType.STRING,
    description: "Model name",
    default: "deepseek-v4-flash"
  },
  minEnglishChars: {
    type: OptionType.NUMBER,
    description: "Minimum English characters before translating",
    default: 8
  },
  maxChars: {
    type: OptionType.NUMBER,
    description: "Maximum message length to translate",
    default: 2000
  },
  concurrency: {
    type: OptionType.NUMBER,
    description: "Concurrent translation requests",
    default: 6
  },
  showLoading: {
    type: OptionType.BOOLEAN,
    description: "Show translating status under messages",
    default: true
  },
  showFailures: {
    type: OptionType.BOOLEAN,
    description: "Show translation failures under messages",
    default: true
  }
});
