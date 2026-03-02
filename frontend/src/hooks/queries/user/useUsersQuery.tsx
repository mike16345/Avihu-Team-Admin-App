import { HOUR_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { createRetryFunction } from "@/lib/utils";
import { useUsersStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

const useUsersQuery = () => {
  const { getAllUsers } = useUsersApi();
  const setUsers = useUsersStore((state) => state.setUsers);

  return useQuery({
    queryKey: [QueryKeys.USERS],
    staleTime: HOUR_STALE_TIME,
    retry: createRetryFunction(404, 2),
    queryFn: () =>
      getAllUsers()
        .then((users) => {
          setUsers(users);
          return users;
        })
        .catch((err) => {
          throw err;
        }),
  });
};

export default useUsersQuery;
