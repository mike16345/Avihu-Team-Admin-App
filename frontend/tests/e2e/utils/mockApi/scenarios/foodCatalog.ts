import { apiRoute, type MockScenarioMap } from "../routes";

export const foodCatalogScenarios = {
  "food-catalog.empty": [
    apiRoute({
      method: "GET",
      pathname: "/foodCatalog/search",
      data: { products: [] },
      message: "Food catalog searched successfully.",
    }),
  ],
} satisfies MockScenarioMap;
