import type { IDietPlan } from "@/interfaces/IDietPlan";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";

interface DietPlanVersionUser {
  dietPlanVersion?: 1 | 2;
}

export type AnyDietPlan = IDietPlan | IDietPlanV2;

export const usesDietPlanV2 = (user?: DietPlanVersionUser | null): boolean => {
  return user?.dietPlanVersion === 2;
};

export const getStoredDietPlanVersion = (plan?: AnyDietPlan | null): 1 | 2 | null => {
  if (!plan) return null;

  return plan.version === 2 ? 2 : 1;
};

export const resolveDietPlanEditorVersion = (
  plan: AnyDietPlan | null,
  trainer?: DietPlanVersionUser | null
): 1 | 2 => getStoredDietPlanVersion(plan) ?? (usesDietPlanV2(trainer) ? 2 : 1);
