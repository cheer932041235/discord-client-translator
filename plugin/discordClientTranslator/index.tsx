import "./styles.css";

import definePlugin from "@utils/types";

import { settings } from "./settings";
import { TranslationAccessory } from "./TranslationAccessory";

export default definePlugin({
  name: "DiscordClientTranslator",
  description: "Automatically translates visible Discord messages to Chinese through a local DeepSeek translation service.",
  authors: [{ name: "local", id: 0n }],
  enabledByDefault: true,
  settings,
  start() {
    console.info("[DiscordClientTranslator] started");
  },
  renderMessageAccessory: (props: any) => <TranslationAccessory message={props.message} />
});
