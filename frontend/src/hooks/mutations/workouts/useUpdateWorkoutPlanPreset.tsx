import { useWorkoutPlanPresetApi } from "@/hooks/api/useWorkoutPlanPresetsApi";
import { IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import { useMutation } from "@tanstack/react-query";

const useUpdateWorkoutPlanPreset = () => {
  const { updateWorkoutPlanPreset } = useWorkoutPlanPresetApi();
  return useMutation({
    mutationFn: ({
      presetId,
      updatedPreset,
    }: {
      presetId: string;
      updatedPreset: IWorkoutPlanPreset;
    }) => updateWorkoutPlanPreset(presetId, updatedPreset),
  });
};

export default useUpdateWorkoutPlanPreset;
