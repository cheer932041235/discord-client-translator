export interface TranslationResult {
  text: string;
  cached: boolean;
  model?: string;
}

export type TranslationState =
  | { status: "idle" }
  | { status: "queued" }
  | { status: "translating" }
  | { status: "translated"; text: string; cached: boolean; model?: string }
  | { status: "failed"; error: string };
