export interface ICustomItemInstructions {
  item: string;
  quantity: number;
}

export interface IDietItem {
  quantity: number;
  unit: DietItemUnit;
  customInstructions?: ICustomItemInstructions[];
}

export interface IMeal {
  totalProtein: IDietItem;
  totalCarbs: IDietItem;
  totalFats?: IDietItem;
  totalVeggies?: IDietItem;
}

export interface IDietPlan {
  meals: IMeal[];
  totalCalories?: number;
}

export type DietItemUnit = "grams" | "spoons";

export interface IServingItem {
  spoons: number;
  grams: number
}

export interface IMenuItem {
  name: string;
  dietaryType: string[];
  foodGroup: string;
  oneServing: IServingItem;
}

export interface IMenue {
  menuName: string;
  menuItems: IMenuItem[]
}
