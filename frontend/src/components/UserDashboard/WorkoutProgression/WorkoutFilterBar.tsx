import { FaNoteSticky } from "react-icons/fa6";

import { MODE_LABELS, type ViewMode } from "./workoutProgressionModel";

const MODE_ORDER: ViewMode[] = ["workout", "muscle"];

type WorkoutFilterBarProps = {
  availableGroups: string[];
  filter: string;
  onFilterChange: (group: string) => void;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onOpenNote: () => void;
};

const getFilterButtonClassName = (isActive: boolean) => {
  if (isActive) return "bg-blue-600 text-white shadow-sm";
  return "text-slate-600 dark:text-slate-300 hover:bg-slate-100";
};

const getModeButtonClassName = (isActive: boolean) => {
  if (isActive) return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
  return "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200";
};

export function WorkoutFilterBar({
  availableGroups,
  filter,
  onFilterChange,
  mode,
  onModeChange,
  onOpenNote,
}: WorkoutFilterBarProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div
          className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5"
          role="group"
          aria-label="מצב תצוגה"
        >
          {MODE_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              disabled={mode === m}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${getModeButtonClassName(
                mode === m
              )}`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onOpenNote}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
        >
          <FaNoteSticky size={11} />
          <span>פתק התקדמות</span>
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {availableGroups.map((group) => (
          <button
            key={group}
            onClick={() => onFilterChange(group)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${getFilterButtonClassName(
              filter === group
            )}`}
          >
            {group}
          </button>
        ))}
      </div>
    </div>
  );
}
