import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import useDietV2CatalogApi from "@/hooks/api/useDietV2CatalogApi";
import { dietV2CatalogKeys } from "@/hooks/queries/dietV2Catalog/dietV2CatalogKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteDietV2CatalogItem = () => {
  const { deleteCatalogItem } = useDietV2CatalogApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCatalogItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietV2CatalogKeys.all });
      toast.success("המאכל הוסר מהקטלוג");
    },
    onError: () => toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE),
  });
};
