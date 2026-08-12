import type {
  DietV2DietTag,
  DietV2MealMacros,
  DietV2TemplateGender,
  DietV2TemplateGoal,
  IDietPlanV2,
  IDietPlanV2Preset,
} from "@/interfaces/IDietPlanV2";

import { computePlanMacroTotals, makeLocalId } from "./dietPlanV2Utils";

export type { DietV2DietTag, DietV2TemplateGender, DietV2TemplateGoal };

export const TEMPLATE_GOAL_LABELS: Record<DietV2TemplateGoal, string> = {
  cutting: "חיטוב",
  maintain: "שימור",
  bulking: "מסה",
};

export const TEMPLATE_GENDER_LABELS: Record<DietV2TemplateGender, string> = {
  women: "נשים",
  men: "גברים",
  both: "לשני המינים",
};

export const TEMPLATE_DIET_TAG_LABELS: Record<DietV2DietTag, string> = {
  vegan: "טבעוני",
  vegetarian: "צמחוני",
  no_dairy: "ללא חלב",
  no_fish: "ללא דגים",
  no_gluten: "ללא גלוטן",
  no_lactose: "ללא לקטוז",
  no_meat: "ללא בשר",
  no_nuts: "ללא אגוזים",
  kosher: "כשר",
};

export interface DietV2Template {
  id: string;
  name: string;
  savedAt: string;
  goal?: DietV2TemplateGoal;
  targetGender?: DietV2TemplateGender;
  dietTags?: DietV2DietTag[];
  mealsCount: number;
  macros: DietV2MealMacros;
  plan: IDietPlanV2;
}

export const computeTemplateMacroTotals = (plan: IDietPlanV2): DietV2MealMacros =>
  computePlanMacroTotals(plan).macros;

export const buildTemplateId = (): string => makeLocalId("tpl");

export const presetToTemplate = (preset: IDietPlanV2Preset): DietV2Template => ({
  id: preset._id ?? buildTemplateId(),
  name: preset.name,
  savedAt: preset.updatedAt ?? preset.createdAt ?? "",
  goal: preset.goal,
  targetGender: preset.targetGender,
  dietTags: preset.dietTags,
  mealsCount: preset.meals.length,
  macros: computeTemplateMacroTotals(preset),
  plan: {
    _id: preset._id,
    version: 2,
    meals: preset.meals,
    highlights: preset.highlights,
  },
});

export const templateToPreset = (
  template: Pick<DietV2Template, "name" | "goal" | "targetGender" | "dietTags" | "plan">
): IDietPlanV2Preset => ({
  name: template.name,
  version: 2,
  meals: template.plan.meals,
  highlights: template.plan.highlights,
  goal: template.goal,
  targetGender: template.targetGender,
  dietTags: template.dietTags,
});
