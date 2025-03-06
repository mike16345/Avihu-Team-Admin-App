import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { IDietPlan } from "@/interfaces/IDietPlan";
import { IMutationProps } from "@/interfaces/interfaces";
import { useMutation } from "@tanstack/react-query";

const useUpdateDietPlan = ({ onSuccess, onError }: IMutationProps<IDietPlan>) => {
  const { updateDietPlanByUserId } = useDietPlanApi();

  return useMutation({
    mutationFn: ({ id, cleanedDietPlan }: { id: string; cleanedDietPlan: IDietPlan }) =>
      updateDietPlanByUserId(id, cleanedDietPlan),
    onSuccess: onSuccess,
    onError: onError,
  });
};

export default useUpdateDietPlan;
