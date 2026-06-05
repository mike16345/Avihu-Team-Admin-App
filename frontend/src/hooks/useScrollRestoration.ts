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
 * Async-rendering problem
 * -----------------------
 * Most pages load data with React Query, so when the user clicks "back"
 * the container is initially short — the saved scrollTop gets clamped to
 * the (small) maxScrollTop, leaving the page at 0. To handle this we
 * observe the container's size for ~1.5s after navigation and keep
 * re-applying the saved scrollTop until either:
 *   - the container is tall enough to honour the saved value, or
 *   - the user scrolls manually (we stop interfering), or
 *   - the timeout expires.
 */
import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const STORAGE_PREFIX = "avihu:scroll:";
const RESTORE_WINDOW_MS = 1500;

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
   * Save scroll position of the OUTGOING location whenever the incoming
   * location changes. Snapshot in useLayoutEffect to read scrollTop
   * before the new render scrolls the container.
   */
  useLayoutEffect(() => {
    const outgoingKey = previousKeyRef.current;
    if (outgoingKey && containerRef.current) {
      writeSaved(outgoingKey, containerRef.current.scrollTop);
    }
    previousKeyRef.current = location.key;
  }, [location.key, containerRef]);

  /**
   * Apply scroll position for the INCOMING location.
   *   POP        → restore (and keep retrying while content streams in)
   *   PUSH/REPL  → jump to top
   */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (navigationType !== "POP") {
      el.scrollTop = 0;
      return;
    }

    const target = readSaved(location.key);
    if (target <= 0) {
      el.scrollTop = 0;
      return;
    }

    // Apply once immediately.
    el.scrollTop = target;

    // If the container is too short for the target, keep re-applying as
    // content streams in. Stop when we reach target (or close enough),
    // when the user scrolls, or after RESTORE_WINDOW_MS.
    let cancelled = false;
    let userInterfered = false;
    let lastSet = target;

    const reapply = () => {
      if (cancelled || userInterfered) return;
      const maxScroll = el.scrollHeight - el.clientHeight;
      const want = Math.min(target, Math.max(0, maxScroll));
      if (Math.abs(el.scrollTop - want) > 1) {
        lastSet = want;
        el.scrollTop = want;
      }
      // Done — content reached the target height.
      if (want >= target - 1) {
        cleanup();
      }
    };

    // If the user scrolls during the restoration window, stop forcing
    // them back. We detect this by comparing to the value we last set.
    const onScroll = () => {
      if (Math.abs(el.scrollTop - lastSet) > 4) {
        userInterfered = true;
        cleanup();
      }
    };

    const ro = new ResizeObserver(reapply);
    // Observe both the container and its first child — the child is the
    // real content whose growth we care about.
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    el.addEventListener("scroll", onScroll, { passive: true });

    const timeoutId = window.setTimeout(cleanup, RESTORE_WINDOW_MS);

    function cleanup() {
      if (cancelled) return;
      cancelled = true;
      ro.disconnect();
      el?.removeEventListener("scroll", onScroll);
      window.clearTimeout(timeoutId);
    }

    return cleanup;
  }, [location.key, navigationType, containerRef]);

  /**
   * Snapshot before tab unload so a refresh-then-back still works.
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
