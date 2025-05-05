import UserForm from "@/components/forms/UserForm";
import BackButton from "@/components/ui/BackButton";
import Loader from "@/components/ui/Loader";
import { MainRoutes } from "@/enums/Routes";
import { IUser } from "@/interfaces/IUser";
import { useNavigate, useParams } from "react-router-dom";
import { weightTab } from "./UserDashboard";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import useAddUser from "@/hooks/mutations/User/useAddUser";
import useUpdateUser from "@/hooks/mutations/User/useUpdateUser";

const UserFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user, isLoading } = useUserQuery(id);
  const editUser = useUpdateUser(id || "");
  const addNewUser = useAddUser();

  const backButtonUrl = `${MainRoutes.USERS}/` + (id ? `${id}?tab=${weightTab}` : "");

  const handleSaveUser = async (user: IUser) => {
    if (id) {
      await editUser.mutateAsync({ id, user });
    } else {
      user.checkInAt = Date.now() + user.remindIn;
      await addNewUser.mutateAsync(user);
    }

    let url = `${MainRoutes.USERS}/`;

    if (addNewUser.isSuccess || editUser.isSuccess) {
      url += `${addNewUser.data?._id || id || ""}?tab=${weightTab}`;
    }

    console.log("url", url);

    navigate(url);
  };

  if (isLoading) return <Loader size="large" />;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-bold text-3xl text-center sm:text-start">פרטי משתמש</h1>
      <BackButton navLink={backButtonUrl} />
      <UserForm
        existingUser={user}
        saveInfo={(user) => handleSaveUser(user)}
        pending={editUser.isPending || addNewUser.isPending}
      />
    </div>
  );
};

export default UserFormPage;
