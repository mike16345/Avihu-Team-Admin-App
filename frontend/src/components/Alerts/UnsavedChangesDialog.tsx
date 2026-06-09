/**
 * UnsavedChangesDialog — reusable confirmation modal shown when the user
 * tries to navigate away from an editor with unsaved changes.
 *
 * Visual language matches the rest of the redesigned admin panel: Heebo,
 * rounded-2xl, soft slate borders, emerald primary action.
 *
 * The host passes `changes` — a list of short human-readable strings
 * describing what's different (e.g. "ארוחה 2 שונתה", "שם אימון A שונה").
 */
import React from "react";

interface UnsavedChangesDialogProps {
  /** When false the dialog is not rendered. */
  open: boolean;
  /** Whether a "save" mutation is currently in flight. */
  isSaving: boolean;
  /** Short human strings describing what's different vs the server. */
  changes: string[];
  /** Subject of the page — e.g. "תפריט תזונה" or "תוכנית האימונים". */
  subject: string;
  onSaveAndContinue: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  isSaving,
  changes,
  subject,
  onSaveAndContinue,
  onDiscard,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <h2 className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">
            יש שינויים שלא נשמרו
          </h2>
          <p className="mt-1 text-right text-sm text-slate-500 dark:text-slate-400">
            ביצעת שינויים ב{subject} שעדיין לא נשמרו. האם לשמור לפני שיוצאים?
          </p>
        </div>

        {changes.length > 0 && (
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-6 py-3">
            <p className="mb-2 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              שינויים שביצעת ({changes.length})
            </p>
            <ul className="space-y-1">
              {changes.slice(0, 8).map((c, i) => (
                <li
                  key={i}
                  className="flex items-center justify-start gap-2 text-xs text-slate-700 dark:text-slate-200"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{c}</span>
                </li>
              ))}
              {changes.length > 8 && (
                <li className="text-right text-xs text-slate-400 dark:text-slate-500">
                  ועוד {changes.length - 8} שינויים נוספים…
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-60"
          >
            בטל
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-60"
          >
            צא בלי לשמור
          </button>
          <button
            type="button"
            onClick={onSaveAndContinue}
            disabled={isSaving}
            className="rounded-xl brand-gradient brand-gradient-hover px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isSaving ? "שומר…" : "שמור והמשך"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesDialog;
