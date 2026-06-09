/**
 * useExtraItemsHistory — remembers every "extra item" the trainer
 * has ever typed across all trainees, so the next time they add one
 * they can pick it from a list instead of retyping.
 *
 * Why localStorage (and not a server field): this is *autocomplete
 * convenience*, not source of truth. The primary truth lives in
 * each trainee's diet-plan document. Losing this list across
 * devices is fine — Avihu primarily works from one machine, and the
 * tradeoff (zero server work, instant feature) is worth it.
 *
 * Items are keyed by macro section ("protein" | "carb" | "fat" |
 * "veggie" etc.) so suggestions stay relevant to the context.
 * Pass the section as the hook arg.
 */
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "elevate.extraItemsHistory.v1";
const MAX_PER_SECTION = 100; // safety cap

type HistoryMap = Record<string, string[]>;

/** Module-level cache so multiple components share the same data. */
let cache: HistoryMap | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const readStore = (): HistoryMap => {
  if (cache) return cache;
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  return cache as HistoryMap;
};

const writeStore = (next: HistoryMap) => {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Quota exceeded / private mode — silently ignore. The feature
    // degrades gracefully (suggestions just won't persist).
  }
  notify();
};

export function useExtraItemsHistory(section: string) {
  // Force re-render on cross-component mutations.
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  const items = (readStore()[section] ?? []) as string[];

  const remember = useCallback(
    (name: string) => {
      const clean = name.trim();
      if (!clean) return;
      const all = readStore();
      const existing = all[section] ?? [];
      // Bump used items to the top (most-recent-first), de-duped.
      const next = [clean, ...existing.filter((n) => n !== clean)].slice(
        0,
        MAX_PER_SECTION
      );
      writeStore({ ...all, [section]: next });
    },
    [section]
  );

  const forget = useCallback(
    (name: string) => {
      const all = readStore();
      const next = (all[section] ?? []).filter((n) => n !== name);
      writeStore({ ...all, [section]: next });
    },
    [section]
  );

  /** Items that contain the query (case-insensitive). */
  const filter = useCallback(
    (query: string): string[] => {
      const q = query.trim().toLowerCase();
      if (!q) return items;
      return items.filter((n) => n.toLowerCase().includes(q));
    },
    [items]
  );

  return { items, remember, forget, filter };
}
