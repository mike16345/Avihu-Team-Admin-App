import type { DietV2OptionMacros, DietV2Plan } from "@/interfaces/IDietPlanV2";

import { computeMealAverage, makeLocalId } from "./dietPlanV2Utils";

export type DietV2TemplateGoal = "cutting" | "maintain" | "bulking";
export type DietV2TemplateGender = "women" | "men" | "both";

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

export type DietV2DietTag =
  | "vegan"
  | "vegetarian"
  | "no_dairy"
  | "no_fish"
  | "no_gluten"
  | "no_lactose"
  | "no_meat"
  | "no_nuts"
  | "kosher";

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
  macros: DietV2OptionMacros;
  macrosOverridden?: boolean;
  plan: DietV2Plan;
}

export const TEMPLATES_STORAGE_KEY = "dietPlanV2:templates";

export const sumPlanMacro = (
  plan: DietV2Plan,
  key: keyof DietV2OptionMacros
): number =>
  plan.meals.reduce((acc, meal) => {
    if (meal.macroMode === "manual" && meal.manualMacros) {
      return acc + (meal.manualMacros[key] || 0);
    }
    return acc + computeMealAverage(meal, key);
  }, 0);

export const computePlanMacroTotals = (plan: DietV2Plan): DietV2OptionMacros => ({
  protein: Math.round(sumPlanMacro(plan, "protein")),
  carbs: Math.round(sumPlanMacro(plan, "carbs")),
  fat: Math.round(sumPlanMacro(plan, "fat")),
  calories: Math.round(sumPlanMacro(plan, "calories")),
});

export const readTemplates = (): DietV2Template[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DietV2Template[];
  } catch {
    return [];
  }
};

export const writeTemplates = (templates: DietV2Template[]): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch {
  }
};

export const upsertTemplate = (template: DietV2Template): void => {
  const current = readTemplates();
  const idx = current.findIndex((t) => t.id === template.id);
  const next = [...current];
  if (idx === -1) next.unshift(template);
  else next[idx] = template;
  writeTemplates(next);
};

export const removeTemplate = (id: string): void => {
  writeTemplates(readTemplates().filter((t) => t.id !== id));
};

export const buildTemplateId = (): string => makeLocalId("tpl");
