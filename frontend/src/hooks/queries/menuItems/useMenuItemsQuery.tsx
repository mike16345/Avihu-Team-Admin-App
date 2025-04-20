import { HOUR_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import { useQuery } from "@tanstack/react-query";

const useMenuItemsQuery = () => {
  const { getAllMenuItems } = useMenuItemApi();

  return useQuery({
    queryKey: [QueryKeys.MENU_ITEMS],
    queryFn: getAllMenuItems,
    staleTime: HOUR_STALE_TIME / 2,
  });
};

export default useMenuItemsQuery;
