import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import { useUsersStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

const useDietPlanV2PresetsQuery = (enabled = true) => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId) || "";

  const { getAllDietPlanV2Presets } = useDietPlanPresetApi();

  return useQuery({
    queryKey: [QueryKeys.DIET_PLAN_PRESETS, 2, trainerId],
    queryFn: getAllDietPlanV2Presets,
    staleTime: FULL_DAY_STALE_TIME / 2,
    enabled,
  });
};

export default useDietPlanV2PresetsQuery;
