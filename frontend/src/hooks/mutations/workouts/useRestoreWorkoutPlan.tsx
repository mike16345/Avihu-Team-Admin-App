import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { QueryKeys } from "@/enums/QueryKeys";

interface RestorePayload {
  userId: string;
  archivedPlanId: string;
}

interface UseRestoreWorkoutPlanProps {
  onSuccess?: (data: ICompleteWorkoutPlan) => void;
  onError?: (err: unknown) => void;
}

const useRestoreWorkoutPlan = ({ onSuccess, onError }: UseRestoreWorkoutPlanProps = {}) => {
  const { restoreWorkoutPlan } = useWorkoutPlanApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, archivedPlanId }: RestorePayload) =>
      restoreWorkoutPlan(userId, archivedPlanId),
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.USER_WORKOUT_PLAN + vars.userId],
      });
      onSuccess?.(data as unknown as ICompleteWorkoutPlan);
    },
    onError,
  });
};

export default useRestoreWorkoutPlan;
