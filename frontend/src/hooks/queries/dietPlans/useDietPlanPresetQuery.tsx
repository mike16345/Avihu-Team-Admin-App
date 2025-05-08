import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const useDietPlanPresetQuery = (id: string) => {
  const { getDietPlanPreset } = useDietPlanPresetApi();

  return useQuery({
    queryKey: [QueryKeys.DIET_PLAN_PRESETS + id],
    queryFn: () => getDietPlanPreset(id),
    enabled: id !== "undefined",
    staleTime: FULL_DAY_STALE_TIME / 2,
    retry: createRetryFunction(404, 2),
  });
};

export default useDietPlanPresetQuery;
