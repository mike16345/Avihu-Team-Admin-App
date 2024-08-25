import { fetchData, patchItem } from "@/API/api";
import { UsersCheckIn } from "@/interfaces/IAnalytics";
import React from "react";

const ANALYTICS_ENDPOINT = `analytics/`;

const useAnalyticsApi = () => {
  const getAllCheckInUsers = () => fetchData<UsersCheckIn[]>(ANALYTICS_ENDPOINT + `checkIns`);

  const checkOffUser = (id: string) =>
    patchItem<UsersCheckIn>(ANALYTICS_ENDPOINT + `checkIns/` + id);

  return { getAllCheckInUsers, checkOffUser };
};

export default useAnalyticsApi;
