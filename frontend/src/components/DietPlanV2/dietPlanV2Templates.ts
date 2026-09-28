import type { DietV2OptionMacros, DietV2Plan } from "@/interfaces/IDietPlanV2";

import { computeMealAverage, makeLocalId } from "./dietPlanV2Utils";

/**
 * Template metadata the trainer fills in (or lets us auto-derive)
 * when saving a plan as a reusable template. Everything except
 * `name`, `plan` and `savedAt` is optional — the trainer can save a
 * quick-and-dirty template first and enrich the metadata later.
 *
 * TODO(Michael): back this with a proper `POST /diet-plan-v2/templates`
 * endpoint. Right now `readTemplates()` / `writeTemplates()` hit
 * localStorage under `TEMPLATES_STORAGE_KEY`.
 */
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

/**
 * Structured dietary restrictions the trainer can toggle when saving
 * a template. Kept separate from the free-text `allergies` field so
 * the templates page can filter on them and card badges stay
 * consistent across templates.
 */
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
  /** Nutritional target this template was built for. Drives the
   *  "מטרה" filter on the templates page + picker. */
  goal?: DietV2TemplateGoal;
  /** Gender the template was tuned for (women/men/both). Kept
   *  optional so old templates keep working with an implicit "both". */
  targetGender?: DietV2TemplateGender;
  /** Structured dietary flags (vegan / no-gluten / …). Rendered as
   *  chips on template cards and filterable via the templates page. */
  dietTags?: DietV2DietTag[];
  mealsCount: number;
  macros: DietV2OptionMacros;
  /** True when the trainer overrode the auto-computed macros. Kept
   *  so the templates page can show a hint that these numbers were
   *  hand-edited. */
  macrosOverridden?: boolean;
  plan: DietV2Plan;
}

export const TEMPLATES_STORAGE_KEY = "dietPlanV2:templates";

/**
 * Sum a single macro across the whole plan, respecting each meal's
 * macro mode: manual meals contribute their trainer-typed totals,
 * auto meals contribute the average of their category options.
 * Shared between the editor's "daily totals" strip and the template
 * save dialog so the two never disagree.
 */
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

/** Rounded daily totals — the values the template save dialog seeds
 *  its editable fields with. */
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
    /* storage unavailable — best effort */
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
