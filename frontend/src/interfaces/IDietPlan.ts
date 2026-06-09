export interface ICustomItem {
  name: string;
  dietaryType: string[];
  foodGroup: string;
  oneServing: {
    grams: number;
    spoons: number;
  };
}

export type DietItemQuantityBlock = {
  quantity: number;
  customItems?: string[];
  extraItems?: string[];
};

export type IDietItem = DietItemQuantityBlock;

export interface IMeal {
  _id?: string;
  totalProtein: DietItemQuantityBlock;
  totalCarbs: DietItemQuantityBlock;
  totalFats: DietItemQuantityBlock;
  totalVeggies: DietItemQuantityBlock;
}

export interface IDietPlan {
  meals: IMeal[];
  totalCalories?: number;
  freeCalories: number;
  fatsPerDay?: number;
  veggiesPerDay?: number;
  customInstructions?: string[];
  supplements: string[];
}

/**
 * Optional trainer-tagged meta on a diet-plan preset. Used by the
 * admin panel to filter and surface key info without opening the menu.
 * All fields are optional — older presets without tagging keep working.
 */
export type DietGoal = "cutting" | "mass";
export type DietaryRestriction =
  | "lactose-free"
  | "vegetarian"
  | "no-fish"
  | "no-meat"
  | "vegan"
  | "gluten-free";

export interface IDietPlanMeta {
  goal?: DietGoal;
  calories?: number;
  proteinServings?: number;
  carbServings?: number;
  fatServings?: number;
  dietaryRestrictions?: DietaryRestriction[];
  /** Sub-trainer (or main-trainer) id of whoever built this menu. */
  builtByTrainerId?: string;
}

export interface IDietPlanPreset extends IDietPlan, IDietPlanMeta {
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
  fats: string[];
  vegetables: string[];
};
