import { useQuery } from "@tanstack/react-query";
import { IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";
import { QueryKeys } from "@/enums/QueryKeys";
import { useWorkoutPlanPresetApi } from "@/hooks/api/useWorkoutPlanPresetsApi";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";

const useWorkoutPlanPresetsQuery = (condition = true) => {
  const { getAllWorkoutPlanPresets } = useWorkoutPlanPresetApi();

  return useQuery<any, any, ApiResponse<IWorkoutPlanPreset[]>, any>({
    queryFn: () => getAllWorkoutPlanPresets(),
    queryKey: [QueryKeys.WORKOUT_PRESETS],
    staleTime: FULL_DAY_STALE_TIME,
    enabled: !!condition,
  });
};

export default useWorkoutPlanPresetsQuery;
