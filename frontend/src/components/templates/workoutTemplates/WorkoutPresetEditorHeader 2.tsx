import { FaDumbbell } from "react-icons/fa6";

export function WorkoutPresetEditorHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-100/60 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
      <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-blue-100/60 dark:bg-blue-950/30 blur-3xl" />
      <div className="relative flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-blue-500/25">
          <FaDumbbell size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">תבנית אימון</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            בנה תבנית חוזרת לשימוש למתאמנים שלך — שם, מאפיינים, אימונים ואירובי
          </p>
        </div>
      </div>
    </div>
  );
}
