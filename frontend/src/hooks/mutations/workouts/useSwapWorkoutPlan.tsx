/**
 * useSwapWorkoutPlan — archive the trainee's current plan + assign a
 * new one in one atomic call. Used by the "החלפת תוכנית לזמן מוגבל"
 * flow (and by any future "permanent replace" action that wants to
 * preserve history).
 *
 * The endpoint is server-side atomic: it sets archivedAt=now on the
 * current active doc and inserts the new doc with archivedAt=null.
 * From the mobile app's point of view, nothing changes — there's
 * still exactly one active doc per userId.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { QueryKeys } from "@/enums/QueryKeys";

interface SwapPayload {
  userId: string;
  plan: ICompleteWorkoutPlan & {
    temporaryUntil?: Date | string;
    assignmentLabel?: string;
  };
}

interface UseSwapWorkoutPlanProps {
  onSuccess?: (data: ICompleteWorkoutPlan) => void;
  onError?: (err: unknown) => void;
}

const useSwapWorkoutPlan = ({ onSuccess, onError }: UseSwapWorkoutPlanProps = {}) => {
  const { swapWorkoutPlan } = useWorkoutPlanApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, plan }: SwapPayload) => swapWorkoutPlan(userId, plan),
    onSuccess: (data, vars) => {
      // Invalidate both the active plan query AND the history query —
      // active plan changed, and the previous active doc just landed
      // in history.
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.USER_WORKOUT_PLAN + vars.userId],
      });
      onSuccess?.(data as unknown as ICompleteWorkoutPlan);
    },
    onError,
  });
};

export default useSwapWorkoutPlan;
