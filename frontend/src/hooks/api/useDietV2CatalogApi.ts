import { deleteItem, fetchData } from "@/API/api";
import type {
  DietV2CatalogCategory,
  DietV2CatalogItem,
  DietV2PopularItemsByCategory,
} from "@/interfaces/IDietPlanV2";
import type { ApiResponse } from "@/types/types";

const ENDPOINT = "menuItems/v2";

const useDietV2CatalogApi = () => {
  const getPopularItems = () =>
    fetchData<ApiResponse<DietV2PopularItemsByCategory>>(`${ENDPOINT}/popular`).then(
      (response) => response.data
    );

  const searchItems = (category: DietV2CatalogCategory, query: string, signal?: AbortSignal) =>
    fetchData<ApiResponse<DietV2CatalogItem[]>>(
      `${ENDPOINT}/search`,
      {
        category,
        q: query,
      },
      undefined,
      signal
    ).then((response) => response.data);

  const deleteCatalogItem = (id: string) =>
    deleteItem<ApiResponse<DietV2CatalogItem>>(`${ENDPOINT}/one`, { id }).then(
      (response) => response.data
    );

  return { deleteCatalogItem, getPopularItems, searchItems };
};

export default useDietV2CatalogApi;
