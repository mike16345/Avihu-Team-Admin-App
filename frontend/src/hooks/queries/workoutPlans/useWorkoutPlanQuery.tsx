import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const useWorkoutPlanQuery = (id: string) => {
  const { getWorkoutPlanByUserId } = useWorkoutPlanApi();

  return useQuery({
    queryFn: () => getWorkoutPlanByUserId(id),
    staleTime: FULL_DAY_STALE_TIME,
    queryKey: [QueryKeys.USER_WORKOUT_PLAN + id],
    enabled: !!id,
    retry: createRetryFunction(404),
  });
};

export default useWorkoutPlanQuery;
