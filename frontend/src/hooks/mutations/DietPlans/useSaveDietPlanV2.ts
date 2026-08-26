import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import { useMutation } from "@tanstack/react-query";

interface SaveDietPlanV2Variables {
  userId: string;
  plan: IDietPlanV2;
  isNew: boolean;
}

const useSaveDietPlanV2 = () => {
  const { addDietPlanV2, updateDietPlanV2ByUserId } = useDietPlanApi();

  return useMutation({
    mutationFn: ({ userId, plan, isNew }: SaveDietPlanV2Variables) =>
      isNew ? addDietPlanV2(userId, plan) : updateDietPlanV2ByUserId(userId, plan),
  });
};

export default useSaveDietPlanV2;
