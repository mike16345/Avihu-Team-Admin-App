import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import useCardioWorkoutApi from "@/hooks/api/useCardioWorkoutPreset";
import { useQuery } from "@tanstack/react-query";

const useGetOneCardioWorkoutQuery = (id: string) => {
  const { getCardioWorkoutById } = useCardioWorkoutApi();

  return useQuery({
    queryKey: [QueryKeys.CARDIO_WORKOUT_PRESET + id],
    queryFn: () => getCardioWorkoutById(id),
    enabled: !!id,
    staleTime: FULL_DAY_STALE_TIME / 2,
  });
};

export default useGetOneCardioWorkoutQuery;
