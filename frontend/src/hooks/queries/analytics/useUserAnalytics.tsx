import { FULL_DAY_STALE_TIME, HOUR_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import { useUsersStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

export const useUsersToCheck = () => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId);
  const { getAllCheckInUsers } = useAnalyticsApi();

  return useQuery({
    queryKey: [QueryKeys.USERS_TO_CHECK, trainerId],
    queryFn: getAllCheckInUsers,
    staleTime: FULL_DAY_STALE_TIME,
  });
};

export const useUsersWithoutWorkoutPlans = () => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId) || "";
  const { getUsersWithoutPlans } = useAnalyticsApi();

  return useQuery({
    queryKey: [QueryKeys.NO_WORKOUT_PLAN, trainerId],
    queryFn: () => getUsersWithoutPlans("workoutPlan"),
    staleTime: HOUR_STALE_TIME * 6,
  });
};

export const useUsersWithoutDietPlans = () => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId);
  const { getUsersWithoutPlans } = useAnalyticsApi();

  return useQuery({
    queryKey: [QueryKeys.NO_DIET_PLAN, trainerId],
    queryFn: () => getUsersWithoutPlans("dietPlan"),
    staleTime: HOUR_STALE_TIME * 6,
  });
};

export const useUsersExpiringThisMonth = () => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId);
  const { getUsersExpiringThisMonth } = useAnalyticsApi();

  return useQuery({
    queryKey: [QueryKeys.EXPIRING_USERS, trainerId],
    queryFn: getUsersExpiringThisMonth,
    staleTime: HOUR_STALE_TIME * 6,
  });
};

const useUserAnalytics = () => {
  const usersToCheckQuery = useUsersToCheck();
  const usersWithoutWorkoutPlansQuery = useUsersWithoutWorkoutPlans();
  const usersWithoutDietPlansQuery = useUsersWithoutDietPlans();
  const usersExpiringThisMonthQuery = useUsersExpiringThisMonth();

  return {
    usersToCheckQuery,
    usersWithoutWorkoutPlansQuery,
    usersWithoutDietPlansQuery,
    usersExpiringThisMonthQuery,
  };
};

export default useUserAnalytics;
