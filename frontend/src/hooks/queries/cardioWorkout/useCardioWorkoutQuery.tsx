import { useQuery } from "@tanstack/react-query";
import { ICardioWorkout } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";
import { QueryKeys } from "@/enums/QueryKeys";
import useCardioWorkoutApi from "@/hooks/api/useCardioWorkoutPreset";

const useCardioWorkoutQuery = () => {
  const { getAllCardioWrkouts } = useCardioWorkoutApi();

  return useQuery<any, any, ApiResponse<ICardioWorkout[]>, any>({
    queryFn: () => getAllCardioWrkouts(),
    queryKey: [QueryKeys.CARDIO_WORKOUT_PRESET],
    staleTime: Infinity,
  });
};

export default useCardioWorkoutQuery;
