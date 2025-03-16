import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { invalidateQueryKeys } from "@/QueryClient/queryClient";
import { toast } from "sonner";

export const onSuccess = (message: string, keys: string[], navigationFunc?: () => void) => {
  toast.success(message);
  invalidateQueryKeys(keys);

  navigationFunc?.();
};

export const onError = (e: any) => {
  toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
    description: e?.data?.message || "",
  });
};
