import { HOUR_STALE_TIME } from "@/constants/constants";
import { useTrainersApi } from "@/hooks/api/useTrainersApi";
import { TrainerPaginatedParams } from "@/interfaces/trainers";
import { useQuery } from "@tanstack/react-query";
import { trainerKeys } from "./trainerKeys";

export const usePaginatedTrainersQuery = (params: TrainerPaginatedParams = {}, enabled = true) => {
  const { getPaginatedTrainers } = useTrainersApi();

  return useQuery({
    queryKey: trainerKeys.paginated(params),
    queryFn: () => getPaginatedTrainers(params),
    staleTime: HOUR_STALE_TIME,
    enabled,
  });
};
