import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useWorkoutPlanPresetApi } from "@/hooks/api/useWorkoutPlanPresetsApi";
import { useQuery } from "@tanstack/react-query";

const useWorkoutPlanPresetQuery = (id: string) => {
  const { getWorkoutPlanPresetById } = useWorkoutPlanPresetApi();

  return useQuery({
    queryKey: [QueryKeys.WORKOUT_PRESETS, id],
    queryFn: () => getWorkoutPlanPresetById(id),
    enabled: !!id,
    staleTime: FULL_DAY_STALE_TIME,
  });
};

export default useWorkoutPlanPresetQuery;
