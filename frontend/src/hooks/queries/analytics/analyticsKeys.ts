import { DashboardJoinedByMonthParams, DashboardSourcesParams } from "@/interfaces/IAnalytics";

export const analyticsKeys = {
  all: ["analytics"] as const,
  dashboard: (trainerId: string) => [...analyticsKeys.all, "dashboard", trainerId] as const,
  summary: (trainerId: string) => [...analyticsKeys.dashboard(trainerId), "summary"] as const,
  sources: (trainerId: string, params: DashboardSourcesParams) =>
    [...analyticsKeys.dashboard(trainerId), "sources", params] as const,
  joinedByMonth: (trainerId: string, params: DashboardJoinedByMonthParams) =>
    [...analyticsKeys.dashboard(trainerId), "joinedByMonth", params] as const,
  closeToLimit: (trainerId: string) =>
    [...analyticsKeys.dashboard(trainerId), "closeToLimit"] as const,
};
