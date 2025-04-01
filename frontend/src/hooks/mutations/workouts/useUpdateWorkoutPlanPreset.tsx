import { useWorkoutPlanPresetApi } from "@/hooks/api/useWorkoutPlanPresetsApi";
import { IMutationProps } from "@/interfaces/interfaces";
import { IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const useUpdateWorkoutPlanPreset = ({
  onSuccess,
  onError,
}: IMutationProps<ApiResponse<IWorkoutPlanPreset>>) => {
  const { updateWorkoutPlanPreset } = useWorkoutPlanPresetApi();
  return useMutation({
    mutationFn: ({
      presetId,
      updatedPreset,
    }: {
      presetId: string;
      updatedPreset: IWorkoutPlanPreset;
    }) => updateWorkoutPlanPreset(presetId, updatedPreset),

    onSuccess: onSuccess,
    onError: onError,
  });
};

export default useUpdateWorkoutPlanPreset;
