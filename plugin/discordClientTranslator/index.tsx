import "./styles.css";

import definePlugin from "@utils/types";
import { showToast, Toasts } from "@webpack/common";

import { clearAllCache } from "./cache";
import { settings } from "./settings";
import { TranslationAccessory } from "./TranslationAccessory";

export default definePlugin({
  name: "DiscordClientTranslator",
  description: "Auto-translate English Discord messages to Chinese via DeepSeek API.",
  authors: [{ name: "local", id: 0n }],
  enabledByDefault: true,
  settings,
  start() {
    console.info("[DiscordClientTranslator] started");
  },
  toolboxActions: {
    "Clear Translation Cache"() {
      const count = clearAllCache();
      showToast(`已清除 ${count} 条翻译缓存`, Toasts.Type.SUCCESS);
    }
  },
  renderMessageAccessory: (props: any) => <TranslationAccessory message={props.message} />
});
