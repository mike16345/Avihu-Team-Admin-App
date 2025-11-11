import { DietItemQuantityBlock, IDietPlan, IDietPlanPreset } from "@/interfaces/IDietPlan";

export function removeIdsAndVersions(obj:IDietPlanPreset) {
  if (Array.isArray(obj)) {
    return obj.map(item => removeIdsAndVersions(item));
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      if (key !== '_id' && key !== '__v') {
        newObj[key] = removeIdsAndVersions(obj[key]);
      }
    }
    return newObj;
  } else {
    return obj;
  }
}

const ensureDietItem = (item?: Partial<DietItemQuantityBlock>): DietItemQuantityBlock => ({
  quantity: item?.quantity ?? 0,
  customItems: item?.customItems ?? [],
  extraItems: item?.extraItems ?? [],
});

export const normalizeDietPlan = (plan: IDietPlan): IDietPlan => ({
  ...plan,
  meals: (plan.meals || []).map((meal) => ({
    ...meal,
    totalProtein: ensureDietItem(meal.totalProtein),
    totalCarbs: ensureDietItem(meal.totalCarbs),
    totalFats: ensureDietItem(meal.totalFats),
    totalVeggies: ensureDietItem(meal.totalVeggies),
  })),
  customInstructions: plan.customInstructions || [],
  supplements: plan.supplements || [],
  freeCalories: plan.freeCalories ?? 0,
});
