/**
 * Mock diet plans — תפריט תזונה לכל מתאמן.
 */
import { IDietPlan } from "@/interfaces/IDietPlan";

export const mockDietPlanByUser: Record<string, IDietPlan> = {
  "mock-1": {
    totalCalories: 1800,
    freeCalories: 200,
    fatsPerDay: 60,
    veggiesPerDay: 3,
    supplements: ["חלבון מי גבינה", "אומגה 3", "מולטי-ויטמין"],
    customInstructions: [
      "<p>לפני אימון: ארוחה עם חלבון + פחמימה</p>",
      "<p>שתייה: לפחות 3 ליטר ביום</p>",
    ],
    meals: [
      {
        totalProtein: { quantity: 1.5, customItems: [], extraItems: [] },
        totalCarbs: { quantity: 2, customItems: [], extraItems: [] },
        totalFats: { quantity: 1, customItems: [], extraItems: [] },
        totalVeggies: { quantity: 1, customItems: [], extraItems: [] },
      },
      {
        totalProtein: { quantity: 1.5, customItems: [], extraItems: [] },
        totalCarbs: { quantity: 1.5, customItems: [], extraItems: [] },
        totalFats: { quantity: 0.5, customItems: [], extraItems: [] },
        totalVeggies: { quantity: 1, customItems: [], extraItems: [] },
      },
      {
        totalProtein: { quantity: 2, customItems: [], extraItems: [] },
        totalCarbs: { quantity: 2, customItems: [], extraItems: [] },
        totalFats: { quantity: 1, customItems: [], extraItems: [] },
        totalVeggies: { quantity: 2, customItems: [], extraItems: [] },
      },
    ],
  },
  "mock-2": {
    totalCalories: 3000,
    freeCalories: 300,
    fatsPerDay: 90,
    veggiesPerDay: 4,
    supplements: ["קריאטין", "חלבון מי גבינה", "BCAA"],
    customInstructions: [
      "<p>5 ארוחות ביום, כל 3 שעות</p>",
      "<p>פחמימות מורכבות לפני וערב אחרי אימון</p>",
    ],
    meals: [
      {
        totalProtein: { quantity: 2, customItems: [], extraItems: [] },
        totalCarbs: { quantity: 3, customItems: [], extraItems: [] },
        totalFats: { quantity: 1, customItems: [], extraItems: [] },
        totalVeggies: { quantity: 1, customItems: [], extraItems: [] },
      },
      {
        totalProtein: { quantity: 2, customItems: [], extraItems: [] },
        totalCarbs: { quantity: 3, customItems: [], extraItems: [] },
        totalFats: { quantity: 1, customItems: [], extraItems: [] },
        totalVeggies: { quantity: 2, customItems: [], extraItems: [] },
      },
    ],
  },
};
