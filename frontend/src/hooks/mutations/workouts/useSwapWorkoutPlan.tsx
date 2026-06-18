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
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.USER_WORKOUT_PLAN + vars.userId],
      });
      onSuccess?.(data as unknown as ICompleteWorkoutPlan);
    },
    onError,
  });
};

export default useSwapWorkoutPlan;
