import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { IDietPlan } from "@/interfaces/IDietPlan";
import { IMutationProps } from "@/interfaces/interfaces";
import { useMutation } from "@tanstack/react-query";

const useAddDietPlan = ({ onSuccess, onError }: IMutationProps<IDietPlan>) => {
  const { addDietPlan } = useDietPlanApi();

  return useMutation({
    mutationFn: addDietPlan,
    onSuccess: onSuccess,
    onError: onError,
  });
};

export default useAddDietPlan;
