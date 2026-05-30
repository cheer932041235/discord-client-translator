import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE_DIR = resolve(ROOT, ".cache");
const CACHE_FILE = resolve(CACHE_DIR, "translations.json");

export function hashText(text) {
  return createHash("sha256").update(text).digest("hex");
}

export class TranslationCache {
  constructor({ enabled = true, fileCache = true } = {}) {
    this.enabled = enabled;
    this.fileCache = fileCache;
    this.items = new Map();
    this.loaded = false;
  }

  load() {
    if (!this.enabled || !this.fileCache || this.loaded) return;
    this.loaded = true;
    if (!existsSync(CACHE_FILE)) return;

    try {
      const data = JSON.parse(readFileSync(CACHE_FILE, "utf8"));
      for (const item of Array.isArray(data.items) ? data.items : []) {
        if (item?.hash && item?.translated) this.items.set(item.hash, item);
      }
    } catch {
      this.items.clear();
    }
  }

  get(hash) {
    if (!this.enabled) return undefined;
    this.load();
    return this.items.get(hash);
  }

  set(hash, translated, meta = {}) {
    if (!this.enabled || !translated) return;
    this.load();
    this.items.set(hash, {
      hash,
      translated,
      model: meta.model,
      createdAt: new Date().toISOString()
    });
    this.save();
  }

  save() {
    if (!this.enabled || !this.fileCache) return;
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify({ items: [...this.items.values()] }, null, 2), "utf8");
  }
}
