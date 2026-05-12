import { DashboardJoinedByMonthParams, DashboardSourcesParams } from "@/interfaces/IAnalytics";

export const analyticsKeys = {
  all: ["analytics"] as const,
  dashboard: () => [...analyticsKeys.all, "dashboard"] as const,
  summary: () => [...analyticsKeys.dashboard(), "summary"] as const,
  sources: (params: DashboardSourcesParams) =>
    [...analyticsKeys.dashboard(), "sources", params] as const,
  joinedByMonth: (params: DashboardJoinedByMonthParams) =>
    [...analyticsKeys.dashboard(), "joinedByMonth", params] as const,
  closeToLimit: () => [...analyticsKeys.dashboard(), "closeToLimit"] as const,
};
