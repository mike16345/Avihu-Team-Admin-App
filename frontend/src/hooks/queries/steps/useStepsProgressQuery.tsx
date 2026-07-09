import { QueryKeys } from "@/enums/QueryKeys";
import { useStepsProgressApi } from "@/hooks/api/useStepsProgressApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const STEPS_PROGRESS_REFRESH_MS = 15 * 60 * 1000;

const useStepsProgressQuery = (userId?: string, from?: string, to?: string) => {
  const { getStepsProgressByUserId } = useStepsProgressApi();

  return useQuery({
    queryFn: () => getStepsProgressByUserId(userId || "", from, to),
    staleTime: STEPS_PROGRESS_REFRESH_MS,
    refetchInterval: STEPS_PROGRESS_REFRESH_MS,
    queryKey: [QueryKeys.USER_STEPS_PROGRESS + userId, from, to],
    enabled: !!userId,
    retry: createRetryFunction(404),
  });
};

export default useStepsProgressQuery;
