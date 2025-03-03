import { MIN_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { useUsersStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

const useUsersQuery = () => {
  const { getAllUsers } = useUsersApi();
  const setUsers = useUsersStore((state) => state.setUsers);

  return useQuery({
    queryKey: [QueryKeys.USERS],
    staleTime: MIN_STALE_TIME,
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
