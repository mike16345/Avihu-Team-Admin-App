/**
 * useScrollRestoration — global scroll-restoration for the admin panel.
 *
 * Behaviour:
 *  - Forward navigation (`PUSH` / `REPLACE`) → start at the top.
 *  - Back / forward (`POP`) → restore the scroll position the page had
 *    last time we left it.
 *
 * We persist scroll positions in `sessionStorage`, keyed by React Router's
 * `location.key` (which is stable across history entries). This survives
 * full reloads within the same browser tab.
 *
 * The scrolling element is the main content container (`<div>` inside
 * `App.tsx`), not the `window`. Pass its ref to this hook.
 */
import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_PREFIX = "avihu:scroll:";

const readSaved = (key: string): number => {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return 0;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
};

const writeSaved = (key: string, top: number) => {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, String(top));
  } catch {
    /* sessionStorage unavailable — best effort */
  }
};

export function useScrollRestoration(
  containerRef: React.RefObject<HTMLElement | null>
) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousKeyRef = useRef<string | null>(null);

  /**
   * Save the scroll position of the OUTGOING location whenever the
   * incoming location changes. We snapshot in a useLayoutEffect so we
   * read the scrollTop before the new render scrolls the container.
   */
  useLayoutEffect(() => {
    const outgoingKey = previousKeyRef.current;
    if (outgoingKey && containerRef.current) {
      writeSaved(outgoingKey, containerRef.current.scrollTop);
    }
    previousKeyRef.current = location.key;
  }, [location.key, containerRef]);

  /**
   * Apply scroll position for the INCOMING location. POP = restore;
   * anything else = top.
   */
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (navigationType === "POP") {
      const saved = readSaved(location.key);
      el.scrollTop = saved;
    } else {
      el.scrollTop = 0;
    }
  }, [location.key, navigationType, containerRef]);

  /**
   * Snapshot the current scroll position before the tab unloads, so a
   * full page reload (followed by a back navigation in another tab)
   * doesn't lose it.
   */
  useEffect(() => {
    const onUnload = () => {
      if (containerRef.current) {
        writeSaved(location.key, containerRef.current.scrollTop);
      }
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [location.key, containerRef]);
}
