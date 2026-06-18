import { QueryKeys } from "@/enums/QueryKeys";
import { useWorkoutPlanApi } from "@/hooks/api/useWorkoutPlanApi";
import { useQuery } from "@tanstack/react-query";
import { HOUR_STALE_TIME } from "@/constants/constants";

const useWorkoutPlanHistoryQuery = (userId: string, enabled = true) => {
  const { getWorkoutPlanHistory } = useWorkoutPlanApi();

  return useQuery({
    queryKey: [QueryKeys.USER_WORKOUT_PLAN + userId, "history"],
    queryFn: () => getWorkoutPlanHistory(userId),
    enabled: !!userId && enabled,
    staleTime: HOUR_STALE_TIME,
    retry: 1,
  });
};

export default useWorkoutPlanHistoryQuery;
