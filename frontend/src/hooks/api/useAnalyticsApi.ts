import { fetchData, patchItem } from "@/API/api";
import { UsersCheckIn, UsersWithoutPlans } from "@/interfaces/IAnalytics";
import React from "react";

const ANALYTICS_ENDPOINT = `analytics/`;

const useAnalyticsApi = () => {
  const getAllCheckInUsers = () => fetchData<UsersCheckIn[]>(ANALYTICS_ENDPOINT + `checkIns`);

  const checkOffUser = (id: string) =>
    patchItem<UsersCheckIn>(ANALYTICS_ENDPOINT + `checkIns/` + id);

  const getUsersWithoutPlans = (colection: string) =>
    fetchData<UsersWithoutPlans[]>(`${ANALYTICS_ENDPOINT}${colection}`);

  const getUsersExpringThisMonth = () =>
    fetchData<UsersWithoutPlans[]>(`${ANALYTICS_ENDPOINT}users/expiring`);

  return { getAllCheckInUsers, checkOffUser, getUsersWithoutPlans, getUsersExpringThisMonth };
};

export default useAnalyticsApi;
