import { deleteItem, fetchData, patchData } from "@/API/api";
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

  const updateCatalogItem = (id: string, name: string) =>
    patchData<ApiResponse<DietV2CatalogItem>>(`${ENDPOINT}/one`, { name }, { id }).then(
      (response) => response.data
    );

  return { deleteCatalogItem, getPopularItems, searchItems, updateCatalogItem };
};

export default useDietV2CatalogApi;
