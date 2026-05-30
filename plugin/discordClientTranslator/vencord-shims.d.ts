declare module "@api/Settings" {
  export function definePluginSettings<T extends Record<string, any>>(settings: T, options?: any): any;
}

declare module "@utils/types" {
  const definePlugin: (plugin: any) => any;
  export default definePlugin;
  export enum OptionType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    SELECT = "select",
    COMPONENT = "component"
  }
}

declare module "@vencord/discord-types" {
  export interface Message {
    id: string;
    channel_id: string;
    content?: string;
    embeds?: any[];
    [key: string]: any;
  }
}

declare module "@webpack/common" {
  export const useEffect: any;
  export const useState: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
