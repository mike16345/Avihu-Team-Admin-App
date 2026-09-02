import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import { useUsersStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

const useDietPlanPresetsQuery = () => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId) || "";

  const { getAllDietPlanPresets } = useDietPlanPresetApi();

  return useQuery({
    queryKey: [QueryKeys.DIET_PLAN_PRESETS, trainerId],
    staleTime: FULL_DAY_STALE_TIME / 2,
    queryFn: () => getAllDietPlanPresets(),
  });
};

export default useDietPlanPresetsQuery;
