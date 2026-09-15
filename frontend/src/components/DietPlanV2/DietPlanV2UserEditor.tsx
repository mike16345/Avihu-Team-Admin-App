import { useRef } from "react";
import { QueryKeys } from "@/enums/QueryKeys";
import useSaveDietPlanV2 from "@/hooks/mutations/DietPlans/useSaveDietPlanV2";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import { useQueryClient } from "@tanstack/react-query";

import DietPlanV2Editor from "./DietPlanV2Editor";

interface DietPlanV2UserEditorProps {
  userId: string;
  initialPlan?: IDietPlanV2;
}

const DietPlanV2UserEditor: React.FC<DietPlanV2UserEditorProps> = ({ userId, initialPlan }) => {
  const queryClient = useQueryClient();
  const savePlan = useSaveDietPlanV2();
  const persistedRef = useRef(Boolean(initialPlan?._id));

  const handlePersist = async (plan: IDietPlanV2) => {
    const saved = await savePlan.mutateAsync({
      userId,
      plan,
      isNew: !persistedRef.current,
    });
    persistedRef.current = true;

    queryClient.setQueryData([`${QueryKeys.USER_DIET_PLAN}${userId}`], {
      dietplan: saved,
      failed: false,
    });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.NO_DIET_PLAN] });

    return saved;
  };

  return <DietPlanV2Editor initialPlan={initialPlan} onPersist={handlePersist} />;
};

export default DietPlanV2UserEditor;
