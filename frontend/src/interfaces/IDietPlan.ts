export interface ICustomItem {
  name: string;
  dietaryType: string[];
  foodGroup: string;
  oneServing: {
    grams: number;
    spoons: number;
  };
}

export interface IDietItem {
  quantity: number;
  customItems?: string[];
  extraItems?: string[];
}

export interface IMeal {
  _id?: string;
  totalProtein: IDietItem;
  totalCarbs: IDietItem;
}

export interface IDietPlan {
  meals: IMeal[];
  totalCalories?: number;
  freeCalories: number;
  fatsPerDay?: number;
  veggiesPerDay?: number;
  customInstructions?: string[];
}

export interface IDietPlanPreset extends IDietPlan {
  name: string;
}

export type DietItemUnit = "grams" | "spoons" | "pieces" | "scoops" | "cups";

export interface IServingItem {
  spoons?: number;
  grams?: number;
  pieces?: number;
  scoops?: number;
  cups?: number;
}

export interface IMenuItem {
  name: string;
  dietaryType: string[];
  foodGroup: string;
  oneServing: IServingItem;
}

export interface IMenue {
  menuName: string;
  menuItems: IMenuItem[];
}

export type CustomItems = {
  carbs: string[];
  protein: string[];
};
