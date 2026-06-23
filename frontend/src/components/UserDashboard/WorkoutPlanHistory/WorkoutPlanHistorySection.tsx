import { FC, useMemo, useState } from "react";
import { toast } from "sonner";

import ConfirmationDialog from "@/components/Alerts/ConfirmationDialog";
import Loader from "@/components/ui/Loader";
import useRestoreWorkoutPlan from "@/hooks/mutations/workouts/useRestoreWorkoutPlan";
import useWorkoutPlanHistoryQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanHistoryQuery";
import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";

import { TemporaryWorkoutPlanBanner } from "./TemporaryWorkoutPlanBanner";
import { WorkoutPlanHistoryHeader } from "./WorkoutPlanHistoryHeader";
import { WorkoutPlanHistoryList } from "./WorkoutPlanHistoryList";
import {
  daysUntil,
  shouldShowTemporaryPlanBanner,
  sortWorkoutPlanHistory,
} from "./workoutPlanHistoryUtils";

interface Props {
  userId: string;
  activePlan?: ICompleteWorkoutPlan | null;
  hideWhenEmpty?: boolean;
  /** When true (used inside the history Dialog), the section drops
   *  its own collapsible header and renders the list expanded by
   *  default — the surrounding Dialog already carries the title. */
  embedded?: boolean;
}

const WorkoutPlanHistorySection: FC<Props> = ({
  userId,
  activePlan,
  hideWhenEmpty = false,
  embedded = false,
}) => {
  const { data, isLoading } = useWorkoutPlanHistoryQuery(userId);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(embedded);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);

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

  const history = useMemo(() => {
    const rows = (data?.data ?? []) as ICompleteWorkoutPlan[];
    return sortWorkoutPlanHistory(rows);
  }, [data]);

  const tempDays = daysUntil(activePlan?.temporaryUntil);
  const showTempBanner = shouldShowTemporaryPlanBanner(activePlan, tempDays);

  const handleRestore = (archivedPlanId?: string) => {
    if (!archivedPlanId) return;
    setPendingRestoreId(archivedPlanId);
  };

  const confirmRestore = () => {
    if (!pendingRestoreId) return;
    setRestoringId(pendingRestoreId);
    restoreMutation.mutate({ userId, archivedPlanId: pendingRestoreId });
    setPendingRestoreId(null);
  };

  if (hideWhenEmpty && !showTempBanner && !isLoading && history.length === 0) {
    return null;
  }

  return (
    <section
      dir="rtl"
      className={
        embedded
          ? "flex flex-col gap-3"
          : "flex flex-col gap-3 rounded-2xl border border-blue-100/60 bg-white px-5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      }
    >
      {/* Hide the collapsible header in embedded mode — the Dialog
          already carries the title + count + close. */}
      {!embedded && (
        <WorkoutPlanHistoryHeader
          historyCount={history.length}
          expanded={expanded}
          onToggleExpanded={() => setExpanded((currentExpanded) => !currentExpanded)}
        />
      )}

      {showTempBanner && activePlan && (
        <TemporaryWorkoutPlanBanner
          activePlan={activePlan}
          temporaryDaysRemaining={tempDays}
          restorePending={restoreMutation.isPending}
          onRestore={handleRestore}
        />
      )}

      {isLoading && history.length === 0 && !showTempBanner && (
        <div className="flex justify-center py-4">
          <Loader size="small" />
        </div>
      )}

      {expanded && history.length > 0 && (
        <WorkoutPlanHistoryList
          history={history}
          restoringId={restoringId}
          restorePending={restoreMutation.isPending}
          onRestore={handleRestore}
        />
      )}

      <ConfirmationDialog
        open={!!pendingRestoreId}
        onOpenChange={(open) => {
          if (!open) setPendingRestoreId(null);
        }}
        onCancel={() => setPendingRestoreId(null)}
        onConfirm={confirmRestore}
        title="לשחזר את התוכנית הזו?"
        description={
          <>
            התוכנית הפעילה תועבר להיסטוריה והתוכנית שבחרת תחזור להיות פעילה.
            <br />
            ודא שזו התוכנית שברצונך להחזיר למתאמן.
          </>
        }
        confirmLabel="שחזר תוכנית"
      />
    </section>
  );
};

export default WorkoutPlanHistorySection;
