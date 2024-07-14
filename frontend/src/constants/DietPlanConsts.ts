import { IDietPlan, IMeal } from "@/interfaces/IDietPlan";

export const defaultMeal: IMeal = {
  totalProtein: { quantity: 1, unit: "grams", customInstructions: [] },
  totalCarbs: { quantity: 1, unit: "grams", customInstructions: [] },
  totalFats: { quantity: 0, unit: "grams", customInstructions: [] },
  totalVeggies: { quantity: 0, unit: "grams", customInstructions: [] },
};

export const defaultDietPlan: IDietPlan = {
  meals: [defaultMeal, defaultMeal, defaultMeal, defaultMeal],
};
