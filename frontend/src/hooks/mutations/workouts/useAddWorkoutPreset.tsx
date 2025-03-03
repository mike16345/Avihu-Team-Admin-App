import { useWorkoutPlanPresetApi } from "@/hooks/api/useWorkoutPlanPresetsApi";
import { IMutationProps } from "@/interfaces/interfaces";
import { IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import { useMutation } from "@tanstack/react-query";

const useAddWorkoutPreset = ({ onSuccess, onError }: IMutationProps<IWorkoutPlanPreset>) => {
  const { addWorkoutPlanPreset } = useWorkoutPlanPresetApi();

  return useMutation({
    mutationFn: addWorkoutPlanPreset,
    onSuccess: onSuccess,
    onError: onError,
  });
};

export default useAddWorkoutPreset;
