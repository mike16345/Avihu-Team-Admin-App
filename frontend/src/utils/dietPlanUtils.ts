import { DietItemQuantityBlock, IDietPlan, IDietPlanPreset } from "@/interfaces/IDietPlan";

export function removeIdsAndVersions(obj: IDietPlanPreset) {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeIdsAndVersions(item));
  } else if (typeof obj === "object" && obj !== null) {
    const newObj = {};
    for (const key in obj) {
      if (key !== "_id" && key !== "__v") {
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

export const normalizePresetForDietPlan = (preset: IDietPlanPreset): IDietPlan => {
  const normalized = normalizeDietPlan(preset);

  return {
    ...(normalized.version !== undefined ? { version: normalized.version } : {}),
    meals: normalized.meals.map((meal) => ({
      totalProtein: meal.totalProtein,
      totalCarbs: meal.totalCarbs,
      totalFats: meal.totalFats,
      totalVeggies: meal.totalVeggies,
    })),
    ...(normalized.totalCalories !== undefined
      ? { totalCalories: normalized.totalCalories }
      : {}),
    freeCalories: normalized.freeCalories,
    ...(normalized.fatsPerDay !== undefined ? { fatsPerDay: normalized.fatsPerDay } : {}),
    ...(normalized.veggiesPerDay !== undefined ? { veggiesPerDay: normalized.veggiesPerDay } : {}),
    ...(normalized.unitDisplayMode !== undefined
      ? { unitDisplayMode: normalized.unitDisplayMode }
      : {}),
    customInstructions: normalized.customInstructions,
    supplements: normalized.supplements,
  };
};
