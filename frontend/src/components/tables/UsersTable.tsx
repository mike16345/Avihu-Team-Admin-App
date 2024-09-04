import { useUsersApi } from "@/hooks/api/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import { columns as userColumns } from "./Columns/Users/UserColumns";
import { DataTableHebrew } from "./DataTableHebrew";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { MIN_STALE_TIME } from "@/constants/constants";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";

export const UsersTable = () => {
  const navigate = useNavigate();
  const { getAllUsers } = useUsersApi();

  const query = useQuery({ queryKey: ["users"], staleTime: MIN_STALE_TIME, queryFn: getAllUsers });

  const handleViewUser = (user: IUser) => {
    navigate(`/users/${user._id}`, { state: user });
  };

  if (query.isLoading) {
    return <Loader size="large" />;
  }

  if (query.isError) {
    return <ErrorPage message={query.error.message} />;
  }

  return (
    <>
      <DataTableHebrew
        data={query.data || []}
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
