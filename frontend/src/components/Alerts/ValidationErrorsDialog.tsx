/**
 * ValidationErrorsDialog — clear, centred dialog that lists EVERY
 * validation error in the current form, in the order they appear.
 *
 * Replaces the previous "first error in a toast" behaviour, which
 * left the user guessing where the rest of the problems live. Each
 * row shows a Hebrew path (e.g. "אימון 1 → תרגיל 3 → חזרות מינ׳") and
 * the message itself.
 */
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ValidationErrorEntry } from "@/lib/utils";
import { FaCircleExclamation, FaXmark } from "react-icons/fa6";

interface ValidationErrorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errors: ValidationErrorEntry[];
  /** Form-specific intro line. Default: "יש לתקן את השדות הבאים לפני שמירה". */
  intro?: string;
}

const ValidationErrorsDialog: React.FC<ValidationErrorsDialogProps> = ({
  open,
  onOpenChange,
  errors,
  intro = "יש לתקן את השדות הבאים לפני שמירה",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-w-lg max-h-[80vh] overflow-hidden p-0 gap-0 rounded-2xl flex flex-col"
        style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
      >
        {/* Header */}
        <header className="flex items-start gap-3 border-b border-rose-100 dark:border-rose-900/40 bg-gradient-to-bl from-rose-50/70 to-transparent dark:from-rose-950/30 px-6 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 ring-1 ring-rose-200/80">
            <FaCircleExclamation size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">
              {errors.length === 1
                ? "נמצאה שגיאה אחת"
                : `נמצאו ${errors.length} שגיאות`}
            </h2>
            <p className="mt-0.5 text-right text-xs text-slate-500 dark:text-slate-400">
              {intro}
            </p>
          </div>
        </header>

        {/* Errors list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {errors.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">לא נמצאו שגיאות</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {errors.map((err, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-3"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                      {err.path || "שדה"}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-700 dark:text-slate-200">
                      {err.message}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-6 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700"
          >
            <FaXmark size={11} />
            הבנתי
          </button>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

export default ValidationErrorsDialog;
