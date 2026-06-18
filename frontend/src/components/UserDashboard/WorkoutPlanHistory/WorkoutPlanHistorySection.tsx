import { FC, useMemo, useState } from "react";

import Loader from "@/components/ui/Loader";
import useWorkoutPlanHistoryQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanHistoryQuery";
import useRestoreWorkoutPlan from "@/hooks/mutations/workouts/useRestoreWorkoutPlan";
import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { toast } from "sonner";

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
}

const WorkoutPlanHistorySection: FC<Props> = ({ userId, activePlan, hideWhenEmpty = false }) => {
  const { data, isLoading } = useWorkoutPlanHistoryQuery(userId);
  const [restoringId, setRestoringId] = useState<string | null>(null);
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

  const history = useMemo(() => {
    const rows = (data?.data ?? []) as ICompleteWorkoutPlan[];
    return sortWorkoutPlanHistory(rows);
  }, [data]);

  const tempDays = daysUntil(activePlan?.temporaryUntil);
  const showTempBanner = shouldShowTemporaryPlanBanner(activePlan, tempDays);

  const handleRestore = (archivedPlanId?: string) => {
    if (!archivedPlanId) return;
    if (!confirm("לשחזר את התוכנית הזו? התוכנית הפעילה תועבר להיסטוריה.")) return;
    setRestoringId(archivedPlanId);
    restoreMutation.mutate({ userId, archivedPlanId });
  };

  if (hideWhenEmpty && !showTempBanner && !isLoading && history.length === 0) {
    return null;
  }

  return (
    <section
      dir="rtl"
      className="flex flex-col gap-3 rounded-2xl border border-blue-100/60 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 shadow-sm"
    >
      <WorkoutPlanHistoryHeader
        historyCount={history.length}
        expanded={expanded}
        onToggleExpanded={() => setExpanded((currentExpanded) => !currentExpanded)}
      />

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
    </section>
  );
};

export default WorkoutPlanHistorySection;
