/**
 * WorkoutPlanHistorySection — surfaces the trainee's plan history
 * inside their profile (workout tab). Three things in one card:
 *
 *  1. **Orange banner** when the active plan is temporary (has
 *     `temporaryUntil`) — shows how many days left + a one-click
 *     "Restore previous plan" button. Per council: restore is
 *     ALWAYS manual, never auto/cron.
 *
 *  2. **History list** — every archived plan, most recent first.
 *     Each row: assignment label or auto-derived name, who built it,
 *     date range. Hover reveals a "Restore" button that clones the
 *     archived plan back to active (and archives the current one).
 *
 *  3. **Empty state** when the trainee has no history yet (every
 *     trainee starts with zero archived plans).
 *
 * The trainer triggers "Swap to temporary plan" from a separate
 * button up in the workout-plan editor — see SwapTemporaryPlanModal.
 */
import { FC, useMemo, useState } from "react";
import {
  FaClockRotateLeft,
  FaTriangleExclamation,
  FaArrowsRotate,
  FaCalendarDays,
  FaUser,
} from "react-icons/fa6";
import useWorkoutPlanHistoryQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanHistoryQuery";
import useRestoreWorkoutPlan from "@/hooks/mutations/workouts/useRestoreWorkoutPlan";
import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import DateUtils from "@/lib/dateUtils";
import { toast } from "sonner";
import Loader from "@/components/ui/Loader";

interface Props {
  userId: string;
  /** The trainee's currently-active plan (archivedAt = null). */
  activePlan?: ICompleteWorkoutPlan | null;
  /**
   * Per council decision: when true (default false), this section
   * renders NOTHING when the trainee has no history yet. Cuts the
   * "empty state shouts at me every day" problem. The orange
   * temporary-plan banner still renders if the active plan is
   * temporary — that's the one legitimate always-on reminder.
   */
  hideWhenEmpty?: boolean;
}

/** Days between now and a date, rounded down. Negative = past. */
const daysUntil = (date?: Date | string | null) => {
  if (!date) return null;
  const t = new Date(date).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((t - Date.now()) / (1000 * 60 * 60 * 24));
};

const WorkoutPlanHistorySection: FC<Props> = ({ userId, activePlan, hideWhenEmpty = false }) => {
  const { data, isLoading } = useWorkoutPlanHistoryQuery(userId);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  // Collapsed-by-default — the strip is reference material, not a
  // primary surface. Trainer clicks to expand only when needed.
  const [expanded, setExpanded] = useState(false);

  const restoreMutation = useRestoreWorkoutPlan({
    onSuccess: () => {
      toast.success("התוכנית שוחזרה בהצלחה");
      setRestoringId(null);
    },
    onError: () => {
      toast.error("שחזור נכשל. נסה שוב.");
      setRestoringId(null);
    },
  });

  // The history endpoint returns archived docs only. Sort defensively
  // (most recent assignedAt first) in case the server returns
  // them in a different order.
  const history = useMemo(() => {
    const rows = (data?.data ?? []) as ICompleteWorkoutPlan[];
    return [...rows].sort((a, b) => {
      const aT = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
      const bT = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
      return bT - aT;
    });
  }, [data]);

  // Temporary-plan banner: only show when the active plan has a
  // future-or-recent temporaryUntil. We keep showing it for 14 days
  // past expiry — that's the "you forgot to restore" nudge window.
  const tempDays = daysUntil(activePlan?.temporaryUntil);
  const showTempBanner = !!activePlan?.temporaryUntil && tempDays !== null && tempDays > -14;
  const tempIsPast = tempDays !== null && tempDays < 0;

  const handleRestore = (archivedPlanId?: string) => {
    if (!archivedPlanId) return;
    if (!confirm("לשחזר את התוכנית הזו? התוכנית הפעילה תועבר להיסטוריה.")) return;
    setRestoringId(archivedPlanId);
    restoreMutation.mutate({ userId, archivedPlanId });
  };

  // Early return — when `hideWhenEmpty` and there's nothing to show,
  // render nothing. The orange temporary-plan banner overrides this:
  // if the active plan IS temporary, we still need to surface the
  // expiry reminder even with zero archived plans.
  if (hideWhenEmpty && !showTempBanner && !isLoading && history.length === 0) {
    return null;
  }

  return (
    <section
      dir="rtl"
      className="flex flex-col gap-3 rounded-2xl border border-blue-100/60 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 shadow-sm"
    >
      {/* Compact 1-line header — click to expand the history list.
          The orange temp banner renders below regardless of expand
          state (it's a time-sensitive reminder). */}
      <header
        role={history.length > 0 ? "button" : undefined}
        tabIndex={history.length > 0 ? 0 : undefined}
        onClick={() => history.length > 0 && setExpanded((s) => !s)}
        onKeyDown={(e) => {
          if (history.length > 0 && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setExpanded((s) => !s);
          }
        }}
        className={`flex items-center justify-between gap-3 ${
          history.length > 0 ? "cursor-pointer select-none" : ""
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
            <FaClockRotateLeft size={12} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              היסטוריית תוכניות
            </h3>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
              {history.length > 0 ? `(${history.length})` : ""}
            </span>
          </div>
        </div>
        {history.length > 0 && (
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 dark:text-slate-500 transition-transform"
            aria-hidden
          >
            {expanded ? "▴" : "▾"}
          </span>
        )}
      </header>

      {/* Temporary-plan banner */}
      {showTempBanner && activePlan && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
            tempIsPast
              ? "border-rose-200 bg-rose-50/60 dark:border-rose-900/40 dark:bg-rose-950/30"
              : "border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/30"
          }`}
        >
          <div className="flex items-start gap-2">
            <FaTriangleExclamation
              size={14}
              className={tempIsPast ? "mt-0.5 text-rose-600" : "mt-0.5 text-amber-600"}
            />
            <div className="text-xs">
              <p
                className={`font-bold ${
                  tempIsPast
                    ? "text-rose-800 dark:text-rose-200"
                    : "text-amber-800 dark:text-amber-200"
                }`}
              >
                {tempIsPast ? "תוכנית זמנית פגה" : "תוכנית זמנית פעילה"}
              </p>
              <p
                className={
                  tempIsPast
                    ? "text-rose-700 dark:text-rose-300"
                    : "text-amber-700 dark:text-amber-300"
                }
              >
                {activePlan.assignmentLabel || "תוכנית זמנית"}
                {activePlan.temporaryUntil &&
                  ` · ${tempIsPast ? "פגה ב־" : "מסתיימת ב־"}${DateUtils.formatDate(
                    new Date(activePlan.temporaryUntil),
                    "DD/MM/YYYY"
                  )}`}
                {tempDays !== null && tempDays >= 0 && ` · נשארו ${tempDays} ימים`}
              </p>
            </div>
          </div>
          {/* Inline restore for the most recent archive — the natural
              "undo" target is the doc this temporary plan replaced. */}
          {activePlan.restoreToPlanId && (
            <button
              type="button"
              onClick={() => handleRestore(activePlan.restoreToPlanId)}
              disabled={restoreMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow disabled:opacity-50"
            >
              <FaArrowsRotate size={11} />
              <span>שחזר תוכנית קודמת</span>
            </button>
          )}
        </div>
      )}

      {/* Loader (rare — only if the endpoint is slow). */}
      {isLoading && history.length === 0 && !showTempBanner && (
        <div className="flex justify-center py-4">
          <Loader size="small" />
        </div>
      )}

      {/* History list — only when EXPANDED and there's content.
          Empty-with-hideWhenEmpty was already returned above; empty-
          without-hideWhenEmpty (unusual caller) renders nothing too,
          since the empty state used to shout and we killed that. */}
      {expanded && history.length > 0 && (
        <ul className="flex flex-col gap-2">
          {history.map((plan) => {
            const label =
              plan.assignmentLabel?.trim() ||
              (plan.workoutPlans?.[0]?.planName
                ? `${plan.workoutPlans[0].planName} +${Math.max(0, (plan.workoutPlans.length || 1) - 1)}`
                : "תוכנית ללא שם");
            const fromTo = plan.assignedAt
              ? `${DateUtils.formatDate(new Date(plan.assignedAt), "DD/MM/YYYY")}${
                  plan.archivedAt
                    ? ` – ${DateUtils.formatDate(new Date(plan.archivedAt), "DD/MM/YYYY")}`
                    : ""
                }`
              : "—";

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
                      {fromTo}
                    </span>
                    {plan.assignedBy && (
                      <span className="inline-flex items-center gap-1">
                        <FaUser size={9} />
                        {/* TODO: resolve trainerId → name via trainers map */}
                        {plan.assignedBy}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestore(plan._id)}
                  disabled={isRestoring || restoreMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow disabled:opacity-50"
                >
                  <FaArrowsRotate size={11} className={isRestoring ? "animate-spin" : ""} />
                  <span>{isRestoring ? "משחזר…" : "שחזר"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default WorkoutPlanHistorySection;
