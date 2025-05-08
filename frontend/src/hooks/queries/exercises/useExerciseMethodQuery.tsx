import { useQuery } from "@tanstack/react-query";
import useExerciseMethodApi from "../../api/useExerciseMethodsApi";
import { IExerciseMethod } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";
import { QueryKeys } from "@/enums/QueryKeys";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";

const useExerciseMethodQuery = () => {
  const { getAllExerciseMethods } = useExerciseMethodApi();

  return useQuery<any, any, ApiResponse<IExerciseMethod[]>, any>({
    queryKey: [QueryKeys.EXERCISE_METHODS],
    queryFn: () => getAllExerciseMethods(),
    staleTime: FULL_DAY_STALE_TIME / 2,
  });
};

export default useExerciseMethodQuery;
