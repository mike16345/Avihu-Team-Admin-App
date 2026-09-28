/**
 * Two-tier food search:
 *   1. Local mock library (instant, curated).
 *   2. Open Food Facts (~200-400ms, 3M products).
 *
 * The local tier always renders first so the picker never shows
 * an empty list while the network call is in flight. OFF results
 * stream in after, deduped against the local results. TanStack
 * Query handles caching by queryKey so identical searches don't
 * re-hit the network — the query is shaped to map cleanly onto a
 * future server-side foods endpoint once Mike builds it.
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { DietV2CategoryKind } from "@/interfaces/IDietPlanV2";
import { searchFoodLibrary, type FoodLibraryItem } from "./dietPlanV2Utils";
import { searchOpenFoodFacts } from "./openFoodFactsAdapter";

export interface UseFoodsSearchOptions {
  enabled?: boolean;
  /** Don't hit the network until the trainer has typed at least
   *  this many characters — avoids spam queries on every keystroke
   *  while they're typing. */
  minChars?: number;
  /** Hard cap on combined result count. */
  limit?: number;
}

export interface FoodsSearchResult {
  /** Local + remote results, deduped, capped. */
  items: FoodLibraryItem[];
  /** True while the OFF query is in-flight. Local results are
   *  always available synchronously, so callers can render
   *  immediately and show a small "+ more from cloud" spinner. */
  isRemoteLoading: boolean;
  /** Set when the remote query errored. UI surfaces this so the
   *  trainer knows it's a network blip, not a missing food. */
  remoteError: Error | null;
}

const STALE_MS = 5 * 60 * 1000;

export const useFoodsSearch = (
  query: string,
  kind?: DietV2CategoryKind,
  options: UseFoodsSearchOptions = {}
): FoodsSearchResult => {
  const { enabled = true, minChars = 2, limit = 12 } = options;
  const cleaned = query.trim();
  const shouldHitNetwork = enabled && cleaned.length >= minChars;

  const localResults = useMemo(() => searchFoodLibrary(cleaned, kind, limit), [cleaned, kind, limit]);

  const remote = useQuery({
    queryKey: ["diet-v2-foods-off", cleaned, kind ?? "any"],
    queryFn: () => searchOpenFoodFacts(cleaned, limit),
    enabled: shouldHitNetwork,
    staleTime: STALE_MS,
    retry: 0,
  });

  const items = useMemo(() => {
    const seen = new Set<string>();
    const out: FoodLibraryItem[] = [];
    for (const item of localResults) {
      const key = item.name;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
    for (const item of remote.data ?? []) {
      // If a remote item matches the kind filter prefer it; if no
      // kind requested, accept all. De-dupe by display name.
      if (kind && item.kind !== kind) continue;
      const key = item.name;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
      if (out.length >= limit) break;
    }
    return out;
  }, [localResults, remote.data, kind, limit]);

  return {
    items,
    isRemoteLoading: remote.isFetching,
    remoteError: remote.error as Error | null,
  };
};
