import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { useTrainersApi } from "@/hooks/api/useTrainersApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { trainerKeys } from "./trainerKeys";

export const useTrainersQuery = (enabled = true) => {
  const { getAllTrainers } = useTrainersApi();

  return useQuery({
    queryKey: trainerKeys.list(),
    queryFn: getAllTrainers,
    staleTime: FULL_DAY_STALE_TIME,
    retry: createRetryFunction(404, 2),
    enabled,
  });
};
