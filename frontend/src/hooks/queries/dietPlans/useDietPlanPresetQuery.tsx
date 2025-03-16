import { QueryKeys } from "@/enums/QueryKeys";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import { useQuery } from "@tanstack/react-query";

const useDietPlanPresetQuery = (id: string) => {
  const { getDietPlanPreset } = useDietPlanPresetApi();

  return useQuery({
    queryKey: [QueryKeys.DIET_PLAN_PRESETS + id],
    queryFn: () => getDietPlanPreset(id),
    enabled: !!id,
    staleTime: Infinity,
  });
};

export default useDietPlanPresetQuery;
