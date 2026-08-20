import { fetchData, sendData, updateItem } from "@/API/api";
import type { FoodCatalogItemInput, FoodCatalogProduct } from "@/interfaces/IFoodCatalog";
import type { ApiResponse } from "@/types/types";

const ENDPOINT = "foodCatalog";

const useFoodCatalogApi = () => {
  const search = (query: string, signal?: AbortSignal) =>
    fetchData<ApiResponse<{ products: FoodCatalogProduct[] }>>(
      `${ENDPOINT}/search`,
      { q: query },
      undefined,
      signal
    ).then((response) => response.data.products);

  const create = (item: FoodCatalogItemInput) =>
    sendData<ApiResponse<FoodCatalogProduct>>(`${ENDPOINT}/admin/items`, item).then(
      (response) => response.data
    );

  const update = (id: string, item: FoodCatalogItemInput) =>
    updateItem<ApiResponse<FoodCatalogProduct>>(`${ENDPOINT}/admin/items`, item, undefined, {
      id,
    }).then((response) => response.data);

  const getFoodCatalogItemById = (id: string, signal?: AbortSignal) =>
    fetchData<ApiResponse<FoodCatalogProduct>>(`${ENDPOINT}/item`, { id }, undefined, signal).then(
      (response) => response.data
    );

  return { create, search, update, getFoodCatalogItemById };
};

export default useFoodCatalogApi;
