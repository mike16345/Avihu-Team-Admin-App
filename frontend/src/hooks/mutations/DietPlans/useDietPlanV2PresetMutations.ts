import { QueryKeys } from "@/enums/QueryKeys";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import type { IDietPlanV2Preset } from "@/interfaces/IDietPlanV2";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useInvalidateV2Presets = () => {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: [QueryKeys.DIET_PLAN_PRESETS] });
};

export const useCreateDietPlanV2Preset = () => {
  const { addDietPlanV2Preset } = useDietPlanPresetApi();
  const invalidate = useInvalidateV2Presets();

  return useMutation({ mutationFn: addDietPlanV2Preset, onSuccess: invalidate });
};

export const useUpdateDietPlanV2Preset = () => {
  const { updateDietPlanV2Preset } = useDietPlanPresetApi();
  const invalidate = useInvalidateV2Presets();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, preset }: { id: string; preset: IDietPlanV2Preset }) =>
      updateDietPlanV2Preset(id, preset),
    onSuccess: (response, { id }) => {
      queryClient.setQueryData([QueryKeys.DIET_PLAN_PRESETS + id], response);
      invalidate();
    },
  });
};

export const useDeleteDietPlanV2Preset = () => {
  const { deleteDietPlanPreset } = useDietPlanPresetApi();
  const invalidate = useInvalidateV2Presets();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDietPlanPreset,
    onSuccess: (_response, id) => {
      queryClient.removeQueries({ queryKey: [QueryKeys.DIET_PLAN_PRESETS + id] });
      invalidate();
    },
  });
};
