import { QueryKeys } from "@/enums/QueryKeys";
import useCardioWorkoutApi from "@/hooks/api/useCardioWorkoutPreset";
import { useQuery } from "@tanstack/react-query";

const useGetOneCardioWorkoutQuery = (id: string) => {
  const { getCardioWorkoutById } = useCardioWorkoutApi();

  return useQuery({
    queryKey: [QueryKeys.CARDIO_WORKOUT_PRESET + id],
    queryFn: () => getCardioWorkoutById(id),
    enabled: !!id,
    staleTime: Infinity,
  });
};

export default useGetOneCardioWorkoutQuery;
