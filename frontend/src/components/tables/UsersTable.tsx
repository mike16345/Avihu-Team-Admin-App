import { useUsersApi } from "@/hooks/api/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import { useEffect, useState } from "react";
import { columns as userColumns } from "./Columns/Users/UserColumns";
import { DataTableHebrew } from "./DataTableHebrew";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";

export const UsersTable = () => {
  const navigate = useNavigate();
  const { getAllUsers } = useUsersApi();

  const [users, setUsers] = useState<IUser[] | null>(null);

  const handleViewUser = (user: IUser) => {
    navigate(`/users/${user._id}`, { state: user });
  };

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(res.data))
      .catch((error) => {
        console.error("error", error);
      });
  }, []);

  if (!users) {
    return "Loading...";
  }

  return (
    <>
      <DataTableHebrew
        data={users}
        columns={userColumns}
        actionButton={<Button onClick={() => navigate(`/users/add`)}>הוסף משתמש</Button>}
        handleSetData={() => console.log("setting data")}
        handleViewData={(user) => handleViewUser(user)}
        handleDeleteData={(user) => console.log("user to delete", user)}
        handleViewNestedData={(data, userId) => console.log("data user", data, userId)}
      />
    </>
  );
};
