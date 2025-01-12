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
  unit: DietItemUnit;
  customItems?: ICustomItem[];
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

export type DietItemUnit = "grams" | "spoons";

export interface IServingItem {
  spoons: number;
  grams: number;
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
