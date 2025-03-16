import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import { IMutationProps } from "@/interfaces/interfaces";
import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { useMutation } from "@tanstack/react-query";

const useUpdateWorkoutPlan = ({ onSuccess, onError }: IMutationProps<ICompleteWorkoutPlan>) => {
  const { updateWorkoutPlanByUserId } = useWorkoutPlanApi();

  return useMutation({
    mutationFn: ({
      id,
      cleanedWorkoutPlan,
    }: {
      id: string;
      cleanedWorkoutPlan: ICompleteWorkoutPlan;
    }) => updateWorkoutPlanByUserId(id, cleanedWorkoutPlan),
    onSuccess: onSuccess,
    onError: onError,
  });
};

export default useUpdateWorkoutPlan;
