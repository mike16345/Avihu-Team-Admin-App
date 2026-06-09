/**
 * useWorkoutPlanHistoryQuery — fetches the trainee's archived workout
 * plans (most recent first) so the trainer can browse and restore.
 *
 * Active plan = the doc with archivedAt = null (fetched separately via
 * useWorkoutPlanQuery). This hook returns ONLY the historical docs.
 *
 * Requires the server endpoint GET /workoutPlans/history (additive,
 * pending Mike's deploy). Until then, 404s silently and history list
 * shows the empty state.
 */
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
    // History is not critical — don't retry forever if the endpoint
    // isn't deployed yet. One retry is plenty.
    retry: 1,
  });
};

export default useWorkoutPlanHistoryQuery;
