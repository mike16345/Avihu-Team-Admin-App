import { HOUR_STALE_TIME } from "@/constants/constants";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import { DashboardSourcesParams } from "@/interfaces/IAnalytics";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { analyticsKeys } from "./analyticsKeys";

export const useGetTrainerDashboardSources = (params: DashboardSourcesParams, enabled = true) => {
  const { getTrainerDashboardSources } = useAnalyticsApi();

  return useQuery({
    queryKey: analyticsKeys.sources(params),
    queryFn: () => getTrainerDashboardSources(params),
    staleTime: HOUR_STALE_TIME,
    retry: createRetryFunction(400, 2),
    enabled,
  });
};
