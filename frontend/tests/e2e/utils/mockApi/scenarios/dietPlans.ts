import {
  abortRoute,
  apiErrorRoute,
  apiRoute,
  jsonFixtureRoute,
  type MockScenarioMap,
} from "../routes";

const DIET_PLAN_PRESETS_PATH = "/presets/dietPlans";
const DIET_PLAN_PRESET_ONE_PATH = `${DIET_PLAN_PRESETS_PATH}/one`;
const MENU_ITEMS_PATH = "/menuItems";
const MENU_ITEMS_FOOD_GROUP_PATH = "/menuItems/foodGroup";
const MENU_ITEMS_ONE_PATH = "/menuItems/one";
const V2_CATALOG_PATH = "/menuItems/v2";
const DIET_PLANS_ERROR_MESSAGE = "Diet plan presets request failed";
const FOOD_GROUPS_ERROR_MESSAGE = "Menu items request failed";

const dietPlansRoute = (variant: string) =>
  jsonFixtureRoute({
    method: "GET",
    pathname: DIET_PLAN_PRESETS_PATH,
    fixture: "presets.dietPlans",
    variant,
  });

const dietPlansErrorRoute = (status: number) =>
  apiErrorRoute({
    method: "GET",
    pathname: DIET_PLAN_PRESETS_PATH,
    message: DIET_PLANS_ERROR_MESSAGE,
    status,
  });

const foodGroupRoute = (variant: string) =>
  jsonFixtureRoute({
    method: "GET",
    pathname: MENU_ITEMS_FOOD_GROUP_PATH,
    fixture: "menuItems.foodGroup",
    variant,
  });

const foodGroupsErrorRoute = (status: number) =>
  apiErrorRoute({
    method: "GET",
    pathname: MENU_ITEMS_FOOD_GROUP_PATH,
    message: FOOD_GROUPS_ERROR_MESSAGE,
    status,
  });

export const dietPlansScenarios = {
  "diet-plans.success": [dietPlansRoute("success")],
  "diet-plans.large": [dietPlansRoute("large")],
  "diet-plans.empty": [dietPlansRoute("empty")],
  "diet-plans.null-data": [dietPlansRoute("null_data")],
  "diet-plans.error-400": [dietPlansErrorRoute(400)],
  "diet-plans.error-401": [dietPlansErrorRoute(401)],
  "diet-plans.error-403": [dietPlansErrorRoute(403)],
  "diet-plans.error-404": [dietPlansErrorRoute(404)],
  "diet-plans.error-500": [dietPlansErrorRoute(500)],
  "diet-plans.network-failure": [
    abortRoute({
      method: "GET",
      pathname: DIET_PLAN_PRESETS_PATH,
      abortErrorCode: "failed",
    }),
  ],
  "diet-plans.delete.success": [
    apiRoute({
      method: "DELETE",
      pathname: DIET_PLAN_PRESET_ONE_PATH,
      data: null,
      message: "Diet plan preset deleted",
    }),
  ],
  "diet-plans.editor.success": [
    jsonFixtureRoute({
      method: "GET",
      pathname: MENU_ITEMS_PATH,
      fixture: "menuItems.collection",
      variant: "success",
    }),
  ],
  "diet-plans.v2-catalog.success": [
    apiRoute({
      method: "GET",
      pathname: `${V2_CATALOG_PATH}/popular`,
      data: {
        protein: [
          {
            _id: "catalog-protein-001",
            trainerId: "trainer-v2-001",
            category: "protein",
            name: "100 גרם חזה עוף",
            normalizedName: "100 גרם חזה עוף",
            usageCount: 12,
            lastUsedAt: "2026-08-11T12:00:00.000Z",
          },
        ],
        carbs: [],
        fat: [],
        vegetables: [],
        addon: [],
        freeCalories: [],
      },
      message: "Popular catalog items",
    }),
    apiRoute({
      method: "GET",
      pathname: `${V2_CATALOG_PATH}/search`,
      data: [
        {
          _id: "catalog-protein-001",
          trainerId: "trainer-v2-001",
          category: "protein",
          name: "100 גרם חזה עוף",
          normalizedName: "100 גרם חזה עוף",
          usageCount: 12,
          lastUsedAt: "2026-08-11T12:00:00.000Z",
        },
      ],
      message: "Catalog search results",
    }),
    apiRoute({
      method: "DELETE",
      pathname: `${V2_CATALOG_PATH}/one`,
      data: null,
      message: "Catalog item deleted",
    }),
  ],
  "diet-plans.food-groups.success": [foodGroupRoute("success")],
  "diet-plans.food-groups.large": [foodGroupRoute("large")],
  "diet-plans.food-groups.empty": [foodGroupRoute("empty")],
  "diet-plans.food-groups.null-data": [foodGroupRoute("null_data")],
  "diet-plans.food-groups.error-400": [foodGroupsErrorRoute(400)],
  "diet-plans.food-groups.error-401": [foodGroupsErrorRoute(401)],
  "diet-plans.food-groups.error-403": [foodGroupsErrorRoute(403)],
  "diet-plans.food-groups.error-404": [foodGroupsErrorRoute(404)],
  "diet-plans.food-groups.error-500": [foodGroupsErrorRoute(500)],
  "diet-plans.food-groups.network-failure": [
    abortRoute({
      method: "GET",
      pathname: MENU_ITEMS_FOOD_GROUP_PATH,
      abortErrorCode: "failed",
    }),
  ],
  "diet-plans.food-groups.delete.success": [
    apiRoute({
      method: "DELETE",
      pathname: MENU_ITEMS_ONE_PATH,
      data: null,
      message: "Menu item deleted",
    }),
  ],
} satisfies MockScenarioMap;
