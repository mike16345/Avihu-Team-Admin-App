import { FaArrowsRotate, FaCalendarDays } from "react-icons/fa6";

import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";

import { getWorkoutPlanDateRange, getWorkoutPlanHistoryLabel } from "./workoutPlanHistoryUtils";

type WorkoutPlanHistoryListProps = {
  history: ICompleteWorkoutPlan[];
  restoringId: string | null;
  restorePending: boolean;
  onRestore: (archivedPlanId?: string) => void;
};

const getRestoreIconClassName = (isRestoring: boolean) => {
  if (isRestoring) return "animate-spin";
  return "";
};

const getRestoreButtonLabel = (isRestoring: boolean) => {
  if (isRestoring) return "משחזר…";
  return "שחזר";
};

export function WorkoutPlanHistoryList({
  history,
  restoringId,
  restorePending,
  onRestore,
}: WorkoutPlanHistoryListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {history.map((plan) => {
        const label = getWorkoutPlanHistoryLabel(plan);
        const dateRange = getWorkoutPlanDateRange(plan);
        const isRestoring = restoringId === plan._id;

        return (
          <li
            key={plan._id}
            className="group flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 px-5 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/10 dark:hover:border-blue-900/40"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
                {label}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <FaCalendarDays size={11} />
                  {dateRange}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onRestore(plan._id)}
              disabled={isRestoring || restorePending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow disabled:opacity-50"
            >
              <FaArrowsRotate size={11} className={getRestoreIconClassName(isRestoring)} />
              <span>{getRestoreButtonLabel(isRestoring)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
