/**
 * useNavigationBlocker — global guard for "you have unsaved changes" UX.
 *
 * Why not React Router's `useBlocker`?
 *   - It only works with the `createBrowserRouter` data router.
 *   - This app uses the classic `BrowserRouter`, where useBlocker throws.
 *
 * Why not monkey-patch `window.history.pushState`?
 *   - React Router v6 keeps its own internal location store. Even if you
 *     prevent the URL from updating, RR has already advanced its store
 *     and re-renders with the new route. The patch only catches refreshes.
 *
 * Strategy used here
 * ------------------
 * Registration model. The editor (diet plan, workout plan, ...) registers
 * its dirty state and an "attempt" callback. UI elements that initiate
 * in-app navigation (dashboard tab switch, sidebar links, back button)
 * call `tryGuardedNav(action)` instead of navigating directly. If the
 * guard is dirty, the registered editor's `onAttempt` fires (opens its
 * own dialog) and the navigation is NOT performed. Otherwise the action
 * runs as normal.
 *
 * For the browser's back/forward button we ALSO listen to `popstate`
 * and, if dirty, push the URL back and call `onAttempt`. (For "refresh"
 * and "close tab" the older `useUnsavedChangesWarning` hook handles
 * `beforeunload`.)
 *
 * Only one guard is active at a time. Mount at most one editor with the
 * blocker enabled — the most recent one wins.
 */
import { useCallback, useEffect, useRef } from "react";

type Guard = {
  isDirty: boolean;
  /** Fires when something tried to navigate while dirty. The editor's
   *  responsibility to open the confirmation dialog. The `next` callback
   *  is the action that was intercepted; call it once the user
   *  confirms. */
  onAttempt: (next: () => void) => void;
};

let activeGuard: Guard | null = null;
let popstateInstalled = false;
let lastUrl =
  typeof window !== "undefined"
    ? window.location.pathname + window.location.search + window.location.hash
    : "";

function installPopstateOnce() {
  if (popstateInstalled || typeof window === "undefined") return;
  popstateInstalled = true;
  window.addEventListener("popstate", () => {
    const current = window.location.pathname + window.location.search + window.location.hash;
    if (!activeGuard?.isDirty) {
      lastUrl = current;
      return;
    }
    if (current === lastUrl) return;
    const intended = current;
    // Undo the navigation visually by pushing the previous URL back.
    window.history.pushState(window.history.state, "", lastUrl);
    activeGuard.onAttempt(() => {
      // On confirm — apply the intended URL and notify React Router.
      window.history.pushState(window.history.state, "", intended);
      window.dispatchEvent(new PopStateEvent("popstate"));
      lastUrl = intended;
    });
  });
}

/**
 * Call this from UI elements that initiate navigation (tab switch,
 * link click, back button). Pass the function that performs the actual
 * navigation as `next`. Returns true if the action ran immediately,
 * false if it was deferred behind the dialog.
 */
export function tryGuardedNav(next: () => void): boolean {
  if (activeGuard?.isDirty) {
    activeGuard.onAttempt(next);
    return false;
  }
  next();
  return true;
}

export function useNavigationGuard(isDirty: boolean, onAttempt: (next: () => void) => void): void {
  // Keep the latest callback in a ref so the global slot always sees
  // fresh closures.
  const onAttemptRef = useRef(onAttempt);
  onAttemptRef.current = onAttempt;

  useEffect(() => {
    installPopstateOnce();
    const guard: Guard = {
      isDirty,
      onAttempt: (next) => onAttemptRef.current(next),
    };
    activeGuard = guard;
    return () => {
      if (activeGuard === guard) activeGuard = null;
    };
  }, [isDirty]);
}

/**
 * Convenience wrapper for editors that still want the
 * "proceed-on-target-url" API the old hook exposed. They get back a
 * stable `proceed` function that re-runs the deferred action.
 */
export function useNavigationBlocker(isDirty: boolean, onBlock: (next: () => void) => void) {
  useNavigationGuard(isDirty, onBlock);
  const proceed = useCallback((next: () => void) => next(), []);
  const reset = useCallback(() => {
    /* dialog already closed by the host */
  }, []);
  return { proceed, reset };
}
