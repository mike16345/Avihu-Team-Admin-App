import UserForm from "@/components/forms/UserForm";
import Loader from "@/components/ui/Loader";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { MainRoutes } from "@/enums/Routes";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const UserFormPage = () => {
  const { id } = useParams();
  const navigation = useNavigate();
  const { getUser, addUser, updateUser } = useUsersApi();

  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const onSuccess = () => {
    toast.success(`משתמש נשמר בהצלחה!`);
    queryClient.invalidateQueries({ queryKey: [`users`] });
    navigation(MainRoutes.USERS);
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, { description: e.message });
  };

  const editUser = useMutation({
    mutationFn: ({ id, user }: { id: string; user: IUser }) => updateUser(id, user),
    onSuccess: onSuccess,
    onError: onError,
  });

  const addNewUser = useMutation({
    mutationFn: addUser,
    onSuccess: onSuccess,
    onError: onError,
  });

  const handleSaveUser = (user: IUser) => {
    if (id) {
      editUser.mutate({ id, user });
    } else {
      addNewUser.mutate(user);
    }
  };

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    getUser(id)
      .then((res) => setUser(res))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <Loader size="large" />;

  return (
    <div>
      <h1 className="font-bold text-2xl">פרטי משתמש</h1>
      <UserForm
        existingUser={user}
        saveInfo={(user) => handleSaveUser(user)}
        pending={editUser.isPending || addNewUser.isPending}
      />
    </div>
  );
};

export default UserFormPage;
