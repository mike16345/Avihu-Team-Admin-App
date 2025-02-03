import { IDietPlan, IMeal } from "@/interfaces/IDietPlan";

export const defaultMeal: IMeal = {
  totalProtein: { quantity: 1, customItems: [] },
  totalCarbs: { quantity: 1, customItems: [] },
};

export const defaultDietPlan: IDietPlan = {
  meals: [defaultMeal, defaultMeal, defaultMeal, defaultMeal],
  freeCalories: 0,
  customInstructions: [],
};
