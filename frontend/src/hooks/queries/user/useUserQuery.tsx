import { useQuery } from "@tanstack/react-query";
import { useUsersApi } from "../../api/useUsersApi";
import { QueryKeys } from "@/enums/QueryKeys";

const useUserQuery = (userId?: string, enabled = true) => {
  const { getUser } = useUsersApi();

  return useQuery({
    queryKey: [QueryKeys.USERS, userId],
    enabled: !!userId && enabled,
    queryFn: () => getUser(userId!),
    staleTime: Infinity,
  });
};

export default useUserQuery;
