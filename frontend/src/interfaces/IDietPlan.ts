export interface ICustomItemInstructions extends IDietItem {
  item: string;
}

export interface ICustomProteinInstructions extends ICustomItemInstructions {}
export interface ICustomCarbsInstructions extends ICustomItemInstructions {}
export interface ICustomVeggiesInstructions extends ICustomItemInstructions {}
export interface ICustomFatsInstructions extends ICustomItemInstructions {}

export interface IDietItem {
  quantity: number;
  unit: DietItemUnit;
}

export interface IMeal {
  totalProtein: IDietItem;
  totalCarbs: IDietItem;
  totalFats?: IDietItem;
  totalVeggies?: IDietItem;
  customProteinInstructions?: ICustomProteinInstructions[];
  customCarbsInstructions?: ICustomCarbsInstructions[];
  customVeggiesInstructions?: ICustomVeggiesInstructions[];
  customFatsInstructions?: ICustomFatsInstructions[];
}

export interface IDietPlan {
  meals: IMeal[];
  totalCalories?: number;
}

export type DietItemUnit = "grams" | "spoons";
export type CustomInstructions =
  | "customProteinInstructions"
  | "customCarbsInstructions"
  | "customVeggiesInstructions"
  | "customFatsInstructions";
