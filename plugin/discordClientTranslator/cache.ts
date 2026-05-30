import type { TranslationResult } from "./types";

const cache = new Map<string, TranslationResult>();
const inflight = new Map<string, Promise<TranslationResult>>();

export function hashText(text: string) {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export function getCachedTranslation(hash: string) {
  return cache.get(hash);
}

export function setCachedTranslation(hash: string, result: TranslationResult) {
  if (result.text) cache.set(hash, result);
}

export function clearCachedTranslation(hash: string) {
  cache.delete(hash);
}

export function clearAllCache() {
  const size = cache.size;
  cache.clear();
  return size;
}

export function getInflightTranslation(hash: string) {
  return inflight.get(hash);
}

export function setInflightTranslation(hash: string, promise: Promise<TranslationResult>) {
  inflight.set(hash, promise);
  promise.finally(() => inflight.delete(hash));
}
