import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import { createRetryFunction } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const useMuscleGroupExercisesQuery = (muscleGroup?: string) => {
  const { getExerciseByMuscleGroup } = useExercisePresetApi();

  return useQuery({
    queryKey: [`exercise-${muscleGroup}`],
    queryFn: () => getExerciseByMuscleGroup(muscleGroup!).then((res) => res.data),
    staleTime: FULL_DAY_STALE_TIME,
    enabled: !!muscleGroup,
    retry: createRetryFunction(404),
  });
};

export default useMuscleGroupExercisesQuery;
