import { FaNoteSticky } from "react-icons/fa6";

type ProgressNoteLauncherProps = {
  userFirstName?: string;
  onOpen: () => void;
};

export function ProgressNoteLauncher({ userFirstName, onOpen }: ProgressNoteLauncherProps) {
  return (
    <button
      id="progress-note"
      onClick={onOpen}
      className="group relative flex h-[280px] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30 p-6 text-center shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 ring-2 ring-amber-200/60 transition-transform group-hover:scale-110">
        <FaNoteSticky size={22} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">צור פתק התקדמות</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          לחץ ליצירת פתק אוטומטי עם סיכום ההתקדמות של {userFirstName || "המתאמן"}
        </p>
      </div>
      <span className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-slate-800">
        פתח חלון יצירה ←
      </span>
    </button>
  );
}
