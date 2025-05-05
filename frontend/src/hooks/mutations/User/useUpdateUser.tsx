import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { QueryKeys } from "@/enums/QueryKeys";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const useUpdateUser = (id: string) => {
  const { updateUser } = useUsersApi();
  const queryClient = useQueryClient();

  const onSuccess = () => {
    toast.success(`משתמש נשמר בהצלחה!`);
    queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS, id] });
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, { description: e.data.message });
  };

  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: IUser }) => updateUser(id, user),
    onSuccess,
    onError,
  });
};

export default useUpdateUser;
