import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import { UsersCheckIn } from "@/interfaces/IAnalytics";
import queryClient from "@/QueryClient/queryClient";
import { useUsersStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const useCheckOffUser = () => {
  const trainerId = useUsersStore((state) => state.currentUser?.trainerId);
  const { checkOffUser } = useAnalyticsApi();

  return useMutation({
    mutationFn: (id: string) => checkOffUser(id).then((res) => res.data),
    onSuccess: (data) => {
      toast.success("סומן כנבדק");
      queryClient.setQueryData<UsersCheckIn[] | undefined>(
        [QueryKeys.USERS_TO_CHECK, trainerId],
        (old) => old?.filter((u) => u._id !== data._id) ?? []
      );
    },
    onError: (err: any) => {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
        description: err.response?.data?.message || "",
      });
    },
  });
};

export default useCheckOffUser;
