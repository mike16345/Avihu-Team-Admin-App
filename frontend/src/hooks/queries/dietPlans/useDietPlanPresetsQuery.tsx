import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import { useQuery } from "@tanstack/react-query";

const useDietPlanPresetsQuery = () => {
  const { getAllDietPlanPresets } = useDietPlanPresetApi();

  return useQuery({
    queryKey: [QueryKeys.DIET_PLAN_PRESETS],
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: () => getAllDietPlanPresets(),
  });
};

export default useDietPlanPresetsQuery;
