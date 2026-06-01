import { fetchData, patchItem } from "@/API/api";
import { ApiResponse } from "@/types/types";
import {
  DashboardCloseToLimitResponse,
  DashboardJoinedByMonthParams,
  DashboardJoinedByMonthResponse,
  DashboardSourcesParams,
  DashboardSourcesResponse,
  DashboardSummaryResponse,
  GetDashboardCloseToLimitApiResponse,
  GetDashboardJoinedByMonthApiResponse,
  GetDashboardSourcesApiResponse,
  GetDashboardSummaryApiResponse,
  UsersCheckIn,
  UsersWithoutPlans,
} from "@/interfaces/IAnalytics";

const ANALYTICS_ENDPOINT = `analytics`;

const useAnalyticsApi = () => {
  const getAllCheckInUsers = () =>
    fetchData<ApiResponse<UsersCheckIn[]>>(ANALYTICS_ENDPOINT + `/checkIns`).then(
      (res) => res.data
    );

  const checkOffUser = (id: string) =>
    patchItem<ApiResponse<UsersCheckIn>>(ANALYTICS_ENDPOINT + `/checkIns/one?id=${id}`);

  const getUsersWithoutPlans = (colection: string) =>
    fetchData<ApiResponse<UsersWithoutPlans[]>>(
      `${ANALYTICS_ENDPOINT}/users?collection=${colection}`
    );

  const getUsersExpringThisMonth = () =>
    fetchData<ApiResponse<UsersWithoutPlans[]>>(`${ANALYTICS_ENDPOINT}/users/expiring`);

  const getTrainerDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
    const response = await fetchData<GetDashboardSummaryApiResponse>(
      `${ANALYTICS_ENDPOINT}/dashboard/summary`
    );

    return response.data;
  };

  const getTrainerDashboardSources = async (
    params: DashboardSourcesParams
  ): Promise<DashboardSourcesResponse> => {
    const response = await fetchData<GetDashboardSourcesApiResponse>(
      `${ANALYTICS_ENDPOINT}/dashboard/sources`,
      params
    );

    return response.data;
  };

  const getTrainerDashboardJoinedByMonth = async (
    params: DashboardJoinedByMonthParams
  ): Promise<DashboardJoinedByMonthResponse> => {
    const response = await fetchData<GetDashboardJoinedByMonthApiResponse>(
      `${ANALYTICS_ENDPOINT}/dashboard/joinedByMonth`,
      params
    );

    return response.data;
  };

  const getTrainerDashboardCloseToLimit = async (): Promise<DashboardCloseToLimitResponse> => {
    const response = await fetchData<GetDashboardCloseToLimitApiResponse>(
      `${ANALYTICS_ENDPOINT}/dashboard/closeToLimit`
    );

    return response.data;
  };

  return {
    checkOffUser,
    getAllCheckInUsers,
    getTrainerDashboardCloseToLimit,
    getTrainerDashboardJoinedByMonth,
    getTrainerDashboardSources,
    getTrainerDashboardSummary,
    getUsersExpringThisMonth,
    getUsersWithoutPlans,
  };
};

export default useAnalyticsApi;
