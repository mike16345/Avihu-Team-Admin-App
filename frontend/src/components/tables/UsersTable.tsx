import { useUsersApi } from "@/hooks/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import { useEffect, useState } from "react";
import { columns as userColumns } from "./Columns/Users/UserColumns";
import { DataTableHebrew } from "./DataTableHebrew";

export const UsersTable = () => {
  const { getAllUsers } = useUsersApi();
  const [users, setUsers] = useState<IUser[] | null>(null);

  useEffect(() => {
    getAllUsers()
      .then((users) => setUsers(users))
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
        handleSetData={() => console.log("setting data")}
        handleViewData={(user) => console.log("user to view", user)}
        handleDeleteData={(user) => console.log("user to delete", user)}
        handleViewNestedData={(data, userId) => console.log("data user", data, userId)}
      />
    </>
  );
};
