import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { useSubTrainersApi } from "@/hooks/api/useSubTrainersApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { subTrainerKeys } from "./subTrainerKeys";

export const useSubTrainersQuery = (enabled = true) => {
  const { getAllSubTrainers } = useSubTrainersApi();

  return useQuery({
    queryKey: subTrainerKeys.list(),
    queryFn: getAllSubTrainers,
    staleTime: FULL_DAY_STALE_TIME,
    retry: createRetryFunction(404, 2),
    enabled,
  });
};
