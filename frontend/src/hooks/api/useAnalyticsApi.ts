import { fetchData, patchItem } from "@/API/api";
import { UsersCheckIn, UsersWithoutPlans } from "@/interfaces/IAnalytics";
import { ApiResponse } from "@/types/types";

const ANALYTICS_ENDPOINT = `analytics`;

const useAnalyticsApi = () => {
  const getAllCheckInUsers = () =>
    fetchData<ApiResponse<UsersCheckIn[]>>(ANALYTICS_ENDPOINT + `/checkIns`).then(
      (res) => res.data
    );

  const checkOffUser = (id: string) =>
    patchItem<ApiResponse<UsersCheckIn>>(ANALYTICS_ENDPOINT + `/checkIns/one?id=${id}`);

  const getUsersWithoutPlans = (colection: string) =>
    fetchData<UsersWithoutPlans[]>(`http://localhost:3003/analytics/${colection}`);

  return { getAllCheckInUsers, checkOffUser, getUsersWithoutPlans };
};

export default useAnalyticsApi;
