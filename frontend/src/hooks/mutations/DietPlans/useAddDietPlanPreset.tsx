import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import { IDietPlanPreset } from "@/interfaces/IDietPlan";
import { IMutationProps } from "@/interfaces/interfaces";
import { ApiResponse } from "@/types/types";
import { useMutation } from "@tanstack/react-query";

const useAddDietPlanPreset = ({
  onSuccess,
  onError,
}: IMutationProps<ApiResponse<IDietPlanPreset>>) => {
  const { addDietPlanPreset } = useDietPlanPresetApi();

  return useMutation({
    mutationFn: addDietPlanPreset,
    onSuccess: onSuccess,
    onError: onError,
  });
};

export default useAddDietPlanPreset;
