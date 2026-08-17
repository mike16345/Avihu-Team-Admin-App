import { HOUR_STALE_TIME } from "@/constants/constants";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { analyticsKeys } from "./analyticsKeys";
import { useUsersStore } from "@/store/userStore";

export const useGetTrainerDashboardSummary = (enabled = true) => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId) || "";

  const { getTrainerDashboardSummary } = useAnalyticsApi();

  return useQuery({
    queryKey: analyticsKeys.summary(trainerId),
    queryFn: getTrainerDashboardSummary,
    staleTime: HOUR_STALE_TIME,
    retry: createRetryFunction(400, 2),
    enabled,
  });
};
