import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import useDietV2CatalogApi from "@/hooks/api/useDietV2CatalogApi";
import { dietV2CatalogKeys } from "@/hooks/queries/dietV2Catalog/dietV2CatalogKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateDietV2CatalogItem = () => {
  const { updateCatalogItem } = useDietV2CatalogApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCatalogItem(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dietV2CatalogKeys.all });
      toast.success("המאכל עודכן בקטלוג");
    },
    onError: (error: any) =>
      toast.error(error?.data?.message || ERROR_MESSAGES.GENERIC_ERROR_MESSAGE),
  });
};
