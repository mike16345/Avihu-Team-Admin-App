import { QueryKeys } from "@/enums/QueryKeys";
import useMuscleGroupsApi from "@/hooks/api/useMuscleGroupsApi";
import { onError, onSuccess } from "@/lib/query";

import { useMutation } from "@tanstack/react-query";

const useDeleteMuscleGroup = () => {
  const { deleteMuscleGroup } = useMuscleGroupsApi();

  return useMutation({
    mutationFn: (id: string) => deleteMuscleGroup(id),
    onSuccess: () => onSuccess(`קבוצת שריר נמחקה בהצלחה!`, [QueryKeys.MUSCLE_GROUP]),
    onError: onError,
  });
};

export default useDeleteMuscleGroup;
