import { ONE_HOUR } from "@/constants/constants";
import useFormResponsesApi from "@/hooks/api/useFormResponsesApi";
import { useQuery } from "@tanstack/react-query";

export const useGetUsersLatestResponse = (userId?: string) => {
  const { getUsersLatestResponse } = useFormResponsesApi();

  return useQuery({
    queryKey: ["usersLatestResponse", userId],
    queryFn: () => getUsersLatestResponse(userId!),
    enabled: Boolean(userId),
    staleTime: ONE_HOUR,
  });
};
