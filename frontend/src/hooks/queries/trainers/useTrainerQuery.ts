import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { useTrainersApi } from "@/hooks/api/useTrainersApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { trainerKeys } from "./trainerKeys";

export const useTrainerQuery = (trainerId?: string, enabled = true) => {
  const { getTrainer } = useTrainersApi();

  return useQuery({
    queryKey: trainerKeys.detail(trainerId),
    queryFn: () => getTrainer(trainerId!),
    staleTime: FULL_DAY_STALE_TIME,
    retry: createRetryFunction(404, 2),
    enabled: Boolean(trainerId) && enabled,
  });
};
