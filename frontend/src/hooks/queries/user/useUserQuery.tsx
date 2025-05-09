import { useQuery } from "@tanstack/react-query";
import { useUsersApi } from "../../api/useUsersApi";
import { QueryKeys } from "@/enums/QueryKeys";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";

const useUserQuery = (userId?: string, enabled = true) => {
  const { getUser } = useUsersApi();

  return useQuery({
    queryKey: [QueryKeys.USERS, userId],
    enabled: !!userId && enabled,
    queryFn: () => getUser(userId!),
    staleTime: FULL_DAY_STALE_TIME,
  });
};

export default useUserQuery;
