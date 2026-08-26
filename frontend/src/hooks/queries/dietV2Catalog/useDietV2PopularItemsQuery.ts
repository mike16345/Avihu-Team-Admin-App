import { HOUR_STALE_TIME } from "@/constants/constants";
import useDietV2CatalogApi from "@/hooks/api/useDietV2CatalogApi";
import { useQuery } from "@tanstack/react-query";

import { dietV2CatalogKeys } from "./dietV2CatalogKeys";

export const useDietV2PopularItemsQuery = () => {
  const { getPopularItems } = useDietV2CatalogApi();

  return useQuery({
    queryKey: dietV2CatalogKeys.popular(),
    queryFn: getPopularItems,
    staleTime: HOUR_STALE_TIME,
  });
};
