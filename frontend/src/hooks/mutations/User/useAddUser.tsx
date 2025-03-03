import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import { MainRoutes } from "@/enums/Routes";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const useAddUser = () => {
  const { addUser } = useUsersApi();
  const navigation = useNavigate();
  const queryClient = useQueryClient();

  const onSuccess = () => {
    toast.success(`משתמש נשמר בהצלחה!`);
    queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] });
    navigation(MainRoutes.USERS);
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, { description: e.data.message });
  };

  return useMutation({
    mutationFn: addUser,
    onSuccess,
    onError,
  });
};

export default useAddUser;
