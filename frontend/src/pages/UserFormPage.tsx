import UserForm from "@/components/forms/UserForm";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import { MainRoutes } from "@/enums/Routes";
import { IUser } from "@/interfaces/IUser";
import { useParams } from "react-router-dom";
import { weightTab } from "./UserDashboard";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import useAddUser from "@/hooks/mutations/User/useAddUser";
import useUpdateUser from "@/hooks/mutations/User/useUpdateUser";

const UserFormPage = () => {
  const { id } = useParams();

  const { data: user, isLoading } = useUserQuery(id);
  const editUser = useUpdateUser(id || "");
  const addNewUser = useAddUser();

  const handleSaveUser = (user: IUser) => {
    if (id) {
      editUser.mutate({ id, user });
    } else {
      user.checkInAt = Date.now() + user.remindIn;
      addNewUser.mutate(user);
    }
  };

  if (isLoading) return <Loader size="large" />;

  return (
    <div className="p-8 flex flex-col gap-4">
      <h1 className="font-bold text-3xl">פרטי משתמש</h1>
      <BackButton navLink={`${MainRoutes.USERS}/${id || ``}?tab=${weightTab}`} />
      <UserForm
        existingUser={user}
        saveInfo={(user) => handleSaveUser(user)}
        pending={editUser.isPending || addNewUser.isPending}
      />
    </div>
  );
};

export default UserFormPage;
