import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { IDietPlan } from "@/interfaces/IDietPlan";
import { defaultDietPlan } from "@/constants/DietPlanConsts";

const useGetDietPlan = (userId: string) => {
  const { getDietPlanByUserId } = useDietPlanApi();

  const getDietPlan = async () => {
    try {
      return await getDietPlanByUserId(userId);
    } catch (error: any) {
      if (error.status === 404) {
        return defaultDietPlan;
      }
    }
  };

  return useQuery<IDietPlan>({
    queryKey: [`${QueryKeys.USER_DIET_PLAN}${userId}`],
    enabled: Boolean(userId),
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: () => getDietPlan(),
    retry: createRetryFunction(404, 2),
  });
};

export default useGetDietPlan;
