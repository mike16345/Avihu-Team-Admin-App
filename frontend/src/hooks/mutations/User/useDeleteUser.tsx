import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import { handleDeleteManyPhotos } from "@/hooks/api/useBlogsApi";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { useWeighInPhotosApi } from "@/hooks/api/useWeighInPhotosApi";
import queryClient from "@/QueryClient/queryClient";
import { useUsersStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const useDeleteUser = () => {
  const { setUsers } = useUsersStore();
  const { deleteUser } = useUsersApi();
  const { getUserImageUrls } = useWeighInPhotosApi();

  const handleDeleteUser = async (userId: string) => {
    try {
      const userImageUrls = await getUserImageUrls(userId);
      const urls = userImageUrls.data.map((url) => `images/${url}`);

      await handleDeleteManyPhotos(urls);
      return await deleteUser(userId);
    } catch (err: any) {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE);
      console.error(err);
      return;
    }
  };

  const onSuccess = () => {
    toast.success("המשתמש נמחק בהצלחה!");
    queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS_TO_CHECK] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.NO_DIET_PLAN] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.NO_WORKOUT_PLAN] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.EXPIRING_USERS] });

    setUsers([]);
  };

  const onError = () => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE);
  };

  return useMutation({
    mutationFn: (id: string) => handleDeleteUser(id),
    onSuccess,
    onError,
  });
};

export default useDeleteUser;
