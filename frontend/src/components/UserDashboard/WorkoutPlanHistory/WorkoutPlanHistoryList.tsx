import { FaArrowsRotate, FaCalendarDays, FaUser } from "react-icons/fa6";

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
            className="group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 px-4 py-3 transition-all hover:border-blue-200 dark:hover:border-blue-900/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {label}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <FaCalendarDays size={9} />
                  {dateRange}
                </span>
                {plan.assignedBy && (
                  <span className="inline-flex items-center gap-1">
                    <FaUser size={9} />
                    {plan.assignedBy}
                  </span>
                )}
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
