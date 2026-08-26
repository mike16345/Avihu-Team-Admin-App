import type { IDietPlanV2Preset } from "@/interfaces/IDietPlanV2";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import DietPlanV2TemplatePlanEditor from "./DietPlanV2TemplatePlanEditor";
import {
  buildTemplateId,
  computeTemplateMacroTotals,
  presetToTemplate,
  type DietV2Template,
} from "./dietPlanV2Templates";
import { buildEmptyMeal } from "./dietPlanV2Utils";

interface DietPlanV2PresetPageProps {
  preset?: IDietPlanV2Preset;
}

const createEmptyTemplate = (): DietV2Template => {
  const plan = { version: 2 as const, meals: [buildEmptyMeal(1)], highlights: "" };

  return {
    id: buildTemplateId(),
    name: "תבנית חדשה",
    savedAt: "",
    mealsCount: 1,
    macros: computeTemplateMacroTotals(plan),
    plan,
  };
};

const DietPlanV2PresetPage: React.FC<DietPlanV2PresetPageProps> = ({ preset }) => {
  const navigate = useNavigate();
  const template = useMemo(
    () => (preset ? presetToTemplate(preset) : createEmptyTemplate()),
    [preset]
  );

  const handleClose = () => navigate("/dietPlans");

  return (
    <DietPlanV2TemplatePlanEditor
      template={template}
      operation={preset ? "update" : "create"}
      onClose={handleClose}
      onSaved={() => {
        toast.success("התבנית נשמרה בהצלחה");
        handleClose();
      }}
    />
  );
};

export default DietPlanV2PresetPage;
