import { useQuery } from "@tanstack/react-query";
import { IExerciseMethod } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";
import { QueryKeys } from "@/enums/QueryKeys";
import useCardioWorkoutApi from "@/hooks/api/useCardioWorkoutPreset";

const useCardioWorkoutQuery = () => {
  const { getAllCardioWrkouts } = useCardioWorkoutApi();

  return useQuery<any, any, ApiResponse<IExerciseMethod[]>, any>({
    queryFn: () => getAllCardioWrkouts(),
    queryKey: [QueryKeys.CARDIO_WORKOUT_PRESET],
    staleTime: Infinity,
  });
};

export default useCardioWorkoutQuery;
