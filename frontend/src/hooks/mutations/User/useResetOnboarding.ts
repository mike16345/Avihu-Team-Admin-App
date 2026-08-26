import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import { useUsersApi } from "@/hooks/api/useUsersApi";

const useResetOnboarding = () => {
  const { updateUserField } = useUsersApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => updateUserField(userId, "onboardingStep", "form"),
    onSuccess: (_data, userId) => {
      toast.success("המתאמן חזר למסך השאלון הראשוני");
      queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS, userId] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] });
    },
    onError: (e: any) => {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
        description: e?.data?.message || "",
      });
    },
  });
};

export default useResetOnboarding;
