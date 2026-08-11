import type {
  DietV2DietTag,
  DietV2MealMacros,
  DietV2TemplateGender,
  DietV2TemplateGoal,
  IDietPlanV2,
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
  builtBy?: string;
  allergies?: string;
  notes?: string;
  goal?: DietV2TemplateGoal;
  targetGender?: DietV2TemplateGender;
  dietTags?: DietV2DietTag[];
  mealsCount: number;
  macros: DietV2MealMacros;
  macrosOverridden?: boolean;
  plan: IDietPlanV2;
}

export const TEMPLATES_STORAGE_KEY = "dietPlanV2:templates";

export const computeTemplateMacroTotals = (plan: IDietPlanV2): DietV2MealMacros =>
  computePlanMacroTotals(plan).macros;

export const readTemplates = (): DietV2Template[] => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(TEMPLATES_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((template) => template?.plan?.version === 2) as DietV2Template[];
  } catch {
    return [];
  }
};

export const writeTemplates = (templates: DietV2Template[]): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
};

export const upsertTemplate = (template: DietV2Template): void => {
  const current = readTemplates();
  const index = current.findIndex((candidate) => candidate.id === template.id);
  const next = [...current];
  if (index === -1) next.unshift(template);
  else next[index] = template;
  writeTemplates(next);
};

export const removeTemplate = (id: string): void => {
  writeTemplates(readTemplates().filter((template) => template.id !== id));
};

export const buildTemplateId = (): string => makeLocalId("tpl");
