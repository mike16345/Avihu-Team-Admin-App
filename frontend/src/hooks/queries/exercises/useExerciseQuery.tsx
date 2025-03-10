import { QueryKeys } from "@/enums/QueryKeys";
import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import { useQuery } from "@tanstack/react-query";

const useExerciseQuery = (id: string) => {
  const { getExerciseById } = useExercisePresetApi();

  return useQuery({
    queryKey: [QueryKeys.EXERCISES + id],
    queryFn: () => getExerciseById(id),
    enabled: !!id,
    staleTime: Infinity,
  });
};

export default useExerciseQuery;
