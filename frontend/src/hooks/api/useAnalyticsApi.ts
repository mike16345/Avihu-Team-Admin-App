import { fetchData, patchItem } from "@/API/api";
import { ApiResponse } from "@/types/types";
import { UsersCheckIn, UsersWithoutPlans } from "@/interfaces/IAnalytics";

const ANALYTICS_ENDPOINT = `analytics`;

const useAnalyticsApi = () => {
  const getAllCheckInUsers = () =>
    fetchData<ApiResponse<UsersCheckIn[]>>(ANALYTICS_ENDPOINT + `/checkIns`).then(
      (res) => res.data
    );

  const checkOffUser = (id: string) =>
    patchItem<ApiResponse<UsersCheckIn>>(ANALYTICS_ENDPOINT + `/checkIns/one?id=${id}`);

  const getUsersWithoutPlans = (colection: string) =>
    fetchData<UsersWithoutPlans[]>(`${ANALYTICS_ENDPOINT}${colection}`);

  const getUsersExpringThisMonth = () =>
    fetchData<UsersWithoutPlans[]>(`${ANALYTICS_ENDPOINT}users/expiring`);

  return { getAllCheckInUsers, checkOffUser, getUsersWithoutPlans, getUsersExpringThisMonth };
};

export default useAnalyticsApi;
