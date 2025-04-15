import { QueryKeys } from "@/enums/QueryKeys";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import { useQuery } from "@tanstack/react-query";

const useMenuItemsQuery = () => {
  const { getAllMenuItems } = useMenuItemApi();

  return useQuery({
    queryKey: [QueryKeys.MENU_ITEMS],
    queryFn: getAllMenuItems,
    staleTime:1000 * 5
  });
};

export default useMenuItemsQuery;
