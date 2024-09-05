import { fetchData, patchItem } from "@/API/api";
import { UsersCheckIn } from "@/interfaces/IAnalytics";
import { ApiResponse } from "@/types/types";

const ANALYTICS_ENDPOINT = `analytics`;

const useAnalyticsApi = () => {
  const getAllCheckInUsers = () =>
    fetchData<ApiResponse<UsersCheckIn[]>>(ANALYTICS_ENDPOINT + `/checkIns`).then(
      (res) => res.data
    );

  const checkOffUser = (id: string) =>
    patchItem<UsersCheckIn>(ANALYTICS_ENDPOINT + `/checkIns/one?id=${id}`);

  return { getAllCheckInUsers, checkOffUser };
};

export default useAnalyticsApi;
