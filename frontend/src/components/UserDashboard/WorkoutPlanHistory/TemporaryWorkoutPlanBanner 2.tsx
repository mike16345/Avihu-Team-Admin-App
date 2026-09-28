import { FaArrowsRotate, FaTriangleExclamation } from "react-icons/fa6";

import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { cn } from "@/lib/utils";

import {
  getTemporaryPlanDateText,
  getTemporaryPlanRemainingDaysText,
  isTemporaryPlanExpired,
} from "./workoutPlanHistoryUtils";

type TemporaryWorkoutPlanBannerProps = {
  activePlan: ICompleteWorkoutPlan;
  temporaryDaysRemaining: number | null;
  restorePending: boolean;
  onRestore: (archivedPlanId?: string) => void;
};

const getBannerClassName = (isExpired: boolean) => {
  if (isExpired) {
    return "border-rose-200 bg-rose-50/60 dark:border-rose-900/40 dark:bg-rose-950/30";
  }

  return "border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/30";
};

const getIconClassName = (isExpired: boolean) => {
  if (isExpired) return "mt-0.5 text-rose-600";
  return "mt-0.5 text-amber-600";
};

const getTitleClassName = (isExpired: boolean) => {
  if (isExpired) return "text-rose-800 dark:text-rose-200";
  return "text-amber-800 dark:text-amber-200";
};

const getDescriptionClassName = (isExpired: boolean) => {
  if (isExpired) return "text-rose-700 dark:text-rose-300";
  return "text-amber-700 dark:text-amber-300";
};

const getTitleText = (isExpired: boolean) => {
  if (isExpired) return "תוכנית זמנית פגה";
  return "תוכנית זמנית פעילה";
};

export function TemporaryWorkoutPlanBanner({
  activePlan,
  temporaryDaysRemaining,
  restorePending,
  onRestore,
}: TemporaryWorkoutPlanBannerProps) {
  const isExpired = isTemporaryPlanExpired(temporaryDaysRemaining);
  const dateText = getTemporaryPlanDateText(activePlan, isExpired);
  const remainingDaysText = getTemporaryPlanRemainingDaysText(temporaryDaysRemaining);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
        getBannerClassName(isExpired)
      )}
    >
      <div className="flex items-start gap-2">
        <FaTriangleExclamation size={14} className={getIconClassName(isExpired)} />
        <div className="text-xs">
          <p className={cn("font-bold", getTitleClassName(isExpired))}>{getTitleText(isExpired)}</p>
          <p className={getDescriptionClassName(isExpired)}>
            {activePlan.assignmentLabel || "תוכנית זמנית"}
            {dateText}
            {remainingDaysText}
          </p>
        </div>
      </div>

      {activePlan.restoreToPlanId && (
        <button
          type="button"
          onClick={() => onRestore(activePlan.restoreToPlanId)}
          disabled={restorePending}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow disabled:opacity-50"
        >
          <FaArrowsRotate size={11} />
          <span>שחזר תוכנית קודמת</span>
        </button>
      )}
    </div>
  );
}
