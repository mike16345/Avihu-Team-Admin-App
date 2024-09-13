import { IDietPlan, IMeal } from "@/interfaces/IDietPlan";

export const defaultMeal: IMeal = {
  totalProtein: { quantity: 1, unit: "grams", customItems: [] },
  totalCarbs: { quantity: 1, unit: "grams", customItems: [] },
  totalFats: { quantity: 0, unit: "grams", customItems: [] },
  totalVeggies: { quantity: 0, unit: "grams", customItems: [] },
};

export const defaultDietPlan: IDietPlan = {
  meals: [defaultMeal, defaultMeal, defaultMeal, defaultMeal],
  freeCalories: 0,
  customInstructions: "",
};
