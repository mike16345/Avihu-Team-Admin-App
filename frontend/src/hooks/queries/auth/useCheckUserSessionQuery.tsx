import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { ISession } from "@/interfaces/IUser";
import { useQuery } from "@tanstack/react-query";

const useCheckUserSessionQuery = (token: ISession | null) => {
  const { checkUserSessionToken } = useUsersApi();

  return useQuery({
    queryKey: [QueryKeys.USER_LOGIN_SESSION],
    queryFn: () => checkUserSessionToken(token!),
    enabled: !!token,
    staleTime: FULL_DAY_STALE_TIME / 2,
  });
};

export default useCheckUserSessionQuery;
