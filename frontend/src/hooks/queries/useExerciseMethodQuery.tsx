import { useQuery } from "@tanstack/react-query";
import useExerciseMethodApi from "../api/useExerciseMethodsApi";
import { IExerciseMethod } from "@/interfaces/IWorkoutPlan";
import { ApiResponse } from "@/types/types";
import { QueryKeys } from "@/enums/QueryKeys";

const useExerciseMethodQuery = () => {
  const { getAllExerciseMethods } = useExerciseMethodApi();

  return useQuery<any, any, ApiResponse<IExerciseMethod[]>, any>({
    queryFn: () => getAllExerciseMethods(),
    queryKey: [QueryKeys.EXERCISE_METHODS],
    staleTime: Infinity,
  });
};

export default useExerciseMethodQuery;
