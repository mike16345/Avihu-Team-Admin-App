import { QueryKeys } from "@/enums/QueryKeys";
import { useWorkoutPlanPresetApi } from "@/hooks/api/useWorkoutPlanPresetsApi";
import { onError, onSuccess } from "@/lib/query";

import { useMutation } from "@tanstack/react-query";

const useDeleteWorkoutPreset = () => {
  const { deleteWorkoutPlanPreset } = useWorkoutPlanPresetApi();

  return useMutation({
    mutationFn: (id: string) => deleteWorkoutPlanPreset(id),
    onSuccess: () => onSuccess(`תבנית נמחקה בהצלחה!`, [QueryKeys.WORKOUT_PRESETS]),
    onError: onError,
  });
};

export default useDeleteWorkoutPreset;
