import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import { IDietPlanPreset } from "@/interfaces/IDietPlan";
import { IMutationProps } from "@/interfaces/interfaces";
import { ApiResponse } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const useUpdateDietPlanPreset = ({
  onSuccess,
  onError,
}: IMutationProps<ApiResponse<IDietPlanPreset>>) => {
  const { updateDietPlanPreset } = useDietPlanPresetApi();

  return useMutation({
    mutationFn: ({ id, cleanedDietPlan }: { id: string; cleanedDietPlan: IDietPlanPreset }) =>
      updateDietPlanPreset(id, cleanedDietPlan),
    onSuccess: onSuccess,
    onError: onError,
  });
};

export default useUpdateDietPlanPreset;
