/**
 * useUnsavedChangesWarning — guards against losing in-progress edits.
 *
 * Browser-level beforeunload — fires the native "Leave site?" dialog when
 * the user closes the tab / refreshes / hits the OS back button.
 *
 * NOTE: An earlier version of this hook also used React Router's
 * `useBlocker` for in-app navigation, but that requires a *data* router
 * (`createBrowserRouter`). This app uses the classic `BrowserRouter`, so
 * `useBlocker` throws. If we ever migrate to a data router we can
 * reintroduce in-app blocking with a custom dialog — until then the
 * hook returns a stable "unblocked" object so existing callers keep
 * compiling.
 */
import { useEffect } from "react";

/**
 * Stable shape compatible with React Router's Blocker so existing call
 * sites that read `state === "blocked"` keep compiling. Today this hook
 * never returns "blocked" — see the note above.
 */
type BlockerStub = {
  state: "unblocked" | "blocked" | "proceeding";
  proceed?: () => void;
  reset?: () => void;
  location?: unknown;
};

const UNBLOCKED: BlockerStub = { state: "unblocked" };

export const useUnsavedChangesWarning = (isDirty = false): BlockerStub => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return UNBLOCKED;
};
