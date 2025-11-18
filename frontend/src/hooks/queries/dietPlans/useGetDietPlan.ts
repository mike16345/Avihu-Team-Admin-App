import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { IDietPlan } from "@/interfaces/IDietPlan";

const useGetDietPlan = (userId: string) => {
  const { getDietPlanByUserId } = useDietPlanApi();

  return useQuery<IDietPlan>({
    queryKey: [`${QueryKeys.USER_DIET_PLAN}${userId}`],
    enabled: Boolean(userId),
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: () => getDietPlanByUserId(userId),
    retry: createRetryFunction(404, 2),
  });
};

export default useGetDietPlan;
