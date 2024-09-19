import UserForm from "@/components/forms/UserForm";
import Loader from "@/components/ui/Loader";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { MainRoutes } from "@/enums/Routes";
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const UserFormPage = () => {
  const { id } = useParams();
  const navigation = useNavigate();
  const { getUser, addUser, updateUser } = useUsersApi();

  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSuccess = () => {
    toast.success(`משתמש נשמר בהצלחה!`);
    navigation(MainRoutes.USERS);
  };

  const onError = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, { description: e.message });
  };

  const handleSaveUser = (user: IUser) => {
    if (id) {
      updateUser(id, user)
        .then(() => onSuccess())
        .catch(onError);
    } else {
      addUser(user)
        .then(() => onSuccess())
        .catch(onError);
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

  if (isLoading) return <Loader />;

  return (
    <div>
      <h1 className="font-bold text-2xl">פרטי משתמש</h1>
      <UserForm existingUser={user} saveInfo={(user) => handleSaveUser(user)} />
    </div>
  );
};

export default UserFormPage;
