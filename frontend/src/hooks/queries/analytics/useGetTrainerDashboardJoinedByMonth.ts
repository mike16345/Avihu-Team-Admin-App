import { HOUR_STALE_TIME } from "@/constants/constants";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import { DashboardJoinedByMonthParams } from "@/interfaces/IAnalytics";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { analyticsKeys } from "./analyticsKeys";

export const useGetTrainerDashboardJoinedByMonth = (
  params: DashboardJoinedByMonthParams,
  enabled = true
) => {
  const { getTrainerDashboardJoinedByMonth } = useAnalyticsApi();

  return useQuery({
    queryKey: analyticsKeys.joinedByMonth(params),
    queryFn: () => getTrainerDashboardJoinedByMonth(params),
    staleTime: HOUR_STALE_TIME,
    retry: createRetryFunction(400, 2),
    enabled,
  });
};
