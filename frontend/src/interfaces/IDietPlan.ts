export interface ICustomItemInstructions {
  item: string;
  quantity: number;
}

export interface IDietItem {
  quantity: number;
  unit: DietItemUnit;
  customItems?: ICustomItemInstructions[];
}

export interface IMeal {
  _id?: string;
  totalProtein: IDietItem;
  totalCarbs: IDietItem;
  totalFats?: IDietItem;
  totalVeggies?: IDietItem;
}

export interface IDietPlan {
  meals: IMeal[];
  totalCalories?: number;
  freeCalories: number;
  customInstructions?: string;
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
