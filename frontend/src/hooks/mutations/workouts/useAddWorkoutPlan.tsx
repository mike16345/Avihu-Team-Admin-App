import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import { IMutationProps } from "@/interfaces/interfaces";
import { IWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const useAddWorkoutPlan = ({ onSuccess, onError }: IMutationProps<ApiResponse<IWorkoutPlan>>) => {
  const { addWorkoutPlan } = useWorkoutPlanApi();

  return useMutation({
    mutationFn: addWorkoutPlan,
    onSuccess: onSuccess,
    onError: onError,
  });
};

export default useAddWorkoutPlan;
