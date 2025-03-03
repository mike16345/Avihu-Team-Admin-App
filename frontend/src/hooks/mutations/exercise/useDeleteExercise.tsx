import { QueryKeys } from "@/enums/QueryKeys";
import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import { onError, onSuccess } from "@/lib/query";

import { useMutation } from "@tanstack/react-query";

const useDeleteExercise = () => {
  const { deleteExercise } = useExercisePresetApi();

  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => onSuccess(`תרגיל נמחק בהצלחה!`, [QueryKeys.EXERCISES]),
    onError: onError,
  });
};

export default useDeleteExercise;
