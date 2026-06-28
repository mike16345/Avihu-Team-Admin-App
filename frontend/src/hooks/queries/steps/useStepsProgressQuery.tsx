import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import { useStepsProgressApi } from "@/hooks/api/useStepsProgressApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const useStepsProgressQuery = (userId?: string, from?: string, to?: string) => {
  const { getStepsProgressByUserId } = useStepsProgressApi();

  return useQuery({
    queryFn: () => getStepsProgressByUserId(userId || "", from, to),
    staleTime: FULL_DAY_STALE_TIME,
    queryKey: [QueryKeys.USER_STEPS_PROGRESS + userId, from, to],
    enabled: !!userId,
    retry: createRetryFunction(404),
  });
};

export default useStepsProgressQuery;
