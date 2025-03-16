import { QueryKeys } from "@/enums/QueryKeys";
import useExerciseMethodApi from "@/hooks/api/useExerciseMethodsApi";
import { onError, onSuccess } from "@/lib/query";

import { useMutation } from "@tanstack/react-query";

const useDeleteExerciseMethod = () => {
  const { deleteExerciseMethod } = useExerciseMethodApi();

  return useMutation({
    mutationFn: (id: string) => deleteExerciseMethod(id),
    onSuccess: () => onSuccess(`שיטת אימון נמחקה בהצלחה!`, [QueryKeys.EXERCISE_METHODS]),
    onError: onError,
  });
};

export default useDeleteExerciseMethod;
