import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import { IMutationProps } from "@/interfaces/interfaces";
import { ICompleteWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { useMutation } from "@tanstack/react-query";

const useAddWorkoutPlan = ({ onSuccess, onError }: IMutationProps<ICompleteWorkoutPlan>) => {
  const { addWorkoutPlan } = useWorkoutPlanApi();

  return useMutation({
    mutationFn: ({ id, workoutPlan }: { id: string; workoutPlan: ICompleteWorkoutPlan }) =>
      addWorkoutPlan(id, workoutPlan),
    onSuccess: onSuccess,
    onError: onError,
  });
};

export default useAddWorkoutPlan;
