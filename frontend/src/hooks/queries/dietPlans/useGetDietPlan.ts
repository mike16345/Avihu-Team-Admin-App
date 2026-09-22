import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { defaultDietPlan } from "@/constants/DietPlanConsts";
import type { AnyDietPlan } from "@/lib/dietPlanVersion";

export interface DietPlanQueryResult {
  dietplan: AnyDietPlan;
  failed: boolean;
}

const useGetDietPlan = (userId: string) => {
  const { getDietPlanByUserId } = useDietPlanApi();

  const getDietPlan = async () => {
    try {
      const dietplan = await getDietPlanByUserId(userId);

      return { dietplan, failed: false };
    } catch (error: any) {
      if (error.status === 404) {
        return { dietplan: defaultDietPlan, failed: true };
      }

      throw error;
    }
  };

  return useQuery<DietPlanQueryResult>({
    queryKey: [`${QueryKeys.USER_DIET_PLAN}${userId}`],
    enabled: Boolean(userId),
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: () => getDietPlan(),
    retry: createRetryFunction(404, 2),
  });
};

export default useGetDietPlan;
