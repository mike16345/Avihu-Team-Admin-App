import { HOUR_STALE_TIME } from "@/constants/constants";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { analyticsKeys } from "./analyticsKeys";

export const useGetTrainerDashboardCloseToLimit = (enabled = true) => {
  const { getTrainerDashboardCloseToLimit } = useAnalyticsApi();

  return useQuery({
    queryKey: analyticsKeys.closeToLimit(),
    queryFn: getTrainerDashboardCloseToLimit,
    staleTime: HOUR_STALE_TIME,
    retry: createRetryFunction(400, 2),
    enabled,
  });
};
