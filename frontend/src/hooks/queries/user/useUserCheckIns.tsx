import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import { useQuery } from "@tanstack/react-query";

const useUserCheckIns = () => {
  const { getAllCheckInUsers } = useAnalyticsApi();

  return useQuery({
    queryKey: [QueryKeys.USERS_TO_CHECK],
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: getAllCheckInUsers,
  });
};

export default useUserCheckIns;
