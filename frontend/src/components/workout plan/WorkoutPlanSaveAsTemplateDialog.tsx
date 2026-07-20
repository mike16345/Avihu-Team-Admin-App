import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { FaBookmark, FaCheck, FaTag } from "react-icons/fa6";

import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PresetMetaPanel from "../templates/workoutTemplates/PresetMetaPanel";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
  isSaving: boolean;
}

const WorkoutPlanSaveAsTemplateDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onSubmit,
  isSaving,
}) => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setNameError(null);
    }
  }, [open]);

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("שם התבנית חובה");
      return;
    }
    setNameError(null);
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-500/25 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          dir="rtl"
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[96vw] max-w-6xl origin-bottom -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-hidden rounded-2xl border border-slate-200 bg-white px-7 py-9 shadow-2xl shadow-slate-500/20 duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-50 data-[state=open]:zoom-in-50 data-[state=closed]:slide-out-to-bottom-16 data-[state=open]:slide-in-from-bottom-16 dark:border-slate-800 dark:bg-slate-900"
        >
          <DialogPrimitive.Close className="absolute top-4 rounded-md p-1 text-slate-400 opacity-70 transition-opacity hover:bg-slate-100 hover:text-slate-600 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-200/60 ltr:right-4 rtl:left-4 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
            <span className="sr-only">סגור</span>
          </DialogPrimitive.Close>

          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2 text-right">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/85 via-blue-500/75 to-teal-300/70 text-white shadow-sm shadow-blue-500/10 ring-1 ring-white/10">
                <FaBookmark size={13} />
              </span>
              שמור תבנית
            </DialogTitle>
            <DialogDescription className="text-right">
              קבע שם לתבנית והוסף תיוגים (מטרה, רמה, ציוד…) — הכל אופציונלי חוץ מהשם.
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pl-1">
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <FaTag size={10} />
                שם התבנית *
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirm();
                  }
                }}
                disabled={isSaving}
                placeholder="לדוגמה: פול־בודי למתחילים · ABC · 4 ימים"
                className={`h-11 w-full rounded-xl border bg-blue-50/30 px-3 text-base font-semibold text-slate-800 placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 dark:bg-blue-950/15 dark:text-slate-100 dark:focus:bg-slate-900 ${
                  nameError
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200/60"
                    : "border-blue-100/60 focus:border-blue-400 focus:ring-blue-200/60 dark:border-blue-900/40"
                }`}
              />
              {nameError && (
                <span className="text-[11px] font-bold text-rose-600">{nameError}</span>
              )}
            </label>

            <PresetMetaPanel />
          </div>

          <div className="flex shrink-0 flex-row-reverse items-center justify-start gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <FaCheck size={11} />
              {isSaving ? "שומר…" : "שמור תבנית"}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              ביטול
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

export default WorkoutPlanSaveAsTemplateDialog;
