import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { useSubTrainersApi } from "@/hooks/api/useSubTrainersApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { subTrainerKeys } from "./subTrainerKeys";

export const useSubTrainerQuery = (subTrainerId?: string, enabled = true) => {
  const { getSubTrainer } = useSubTrainersApi();

  return useQuery({
    queryKey: subTrainerKeys.detail(subTrainerId),
    queryFn: () => getSubTrainer(subTrainerId!),
    staleTime: FULL_DAY_STALE_TIME,
    retry: createRetryFunction(404, 2),
    enabled: Boolean(subTrainerId) && enabled,
  });
};
