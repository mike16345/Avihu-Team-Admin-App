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
        className="mx-4 w-full max-w-md overflow-hidden rounded-[20px] border border-[#E6ECF2] dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-[0_20px_60px_rgba(30,50,70,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-right text-lg font-semibold text-[#172B4D] dark:text-slate-50">
            יש שינויים שלא נשמרו
          </h2>
          <p className="mt-1.5 text-right text-sm leading-relaxed text-[#667085]">
            ביצעת שינויים ב{subject} שעדיין לא נשמרו. האם לשמור לפני שיוצאים?
          </p>
        </div>

        {changes.length > 0 && (
          <div className="mx-6 mb-4 rounded-[14px] border border-[#E6ECF2] bg-[#F8FAFC] px-4 py-3 dark:border-slate-800/70 dark:bg-slate-800/30">
            <p className="mb-2 text-right text-[11px] font-medium text-[#667085]">
              שינויים שביצעת · {changes.length}
            </p>
            <ul className="space-y-1.5">
              {changes.slice(0, 8).map((c, i) => (
                <li
                  key={i}
                  className="flex items-center justify-start gap-2 text-[13px] text-[#172B4D] dark:text-slate-200"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7DB7E8]" />
                  <span>{c}</span>
                </li>
              ))}
              {changes.length > 8 && (
                <li className="text-right text-xs text-[#667085]">
                  ועוד {changes.length - 8} שינויים נוספים…
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 px-6 pb-5 pt-1 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-full border border-[#E6ECF2] bg-white px-4 py-1.5 text-sm font-medium text-[#172B4D] transition-colors hover:bg-[#F8FAFC] disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            בטל
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="rounded-full border border-[#E6ECF2] bg-white px-4 py-1.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900"
          >
            צא בלי לשמור
          </button>
          <button
            type="button"
            onClick={onSaveAndContinue}
            disabled={isSaving}
            className="rounded-full bg-[#3B82F6] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60"
          >
            {isSaving ? "שומר…" : "שמור והמשך"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesDialog;
