import { IDietPlan, IMeal } from "@/interfaces/IDietPlan";

export const defaultMeal: IMeal = {
  totalProtein: { quantity: 1, customItems: [], extraItems: [] },
  totalCarbs: { quantity: 1, customItems: [], extraItems: [] },
  totalFats: { quantity: 0, customItems: [], extraItems: [] },
  totalVeggies: { quantity: 0, customItems: [], extraItems: [] },
};

export const defaultDietPlan: IDietPlan = {
  meals: [defaultMeal, defaultMeal, defaultMeal, defaultMeal],
  freeCalories: 0,
  customInstructions: [],
  supplements: [],
};
