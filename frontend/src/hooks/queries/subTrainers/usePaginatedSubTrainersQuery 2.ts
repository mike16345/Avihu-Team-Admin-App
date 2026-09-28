import { HOUR_STALE_TIME } from "@/constants/constants";
import { useSubTrainersApi } from "@/hooks/api/useSubTrainersApi";
import { SubTrainerPaginatedParams } from "@/interfaces/trainers";
import { useQuery } from "@tanstack/react-query";
import { subTrainerKeys } from "./subTrainerKeys";

export const usePaginatedSubTrainersQuery = (
  params: SubTrainerPaginatedParams = {},
  enabled = true
) => {
  const { getPaginatedSubTrainers } = useSubTrainersApi();

  return useQuery({
    queryKey: subTrainerKeys.paginated(params),
    queryFn: () => getPaginatedSubTrainers(params),
    staleTime: HOUR_STALE_TIME,
    enabled,
  });
};
