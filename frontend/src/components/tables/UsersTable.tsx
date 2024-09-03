import { useUsersApi } from "@/hooks/api/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import { useEffect, useState } from "react";
import { columns as userColumns } from "./Columns/Users/UserColumns";
import { DataTableHebrew } from "./DataTableHebrew";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { MIN_STALE_TIME } from "@/constants/constants";

export const UsersTable = () => {
  const navigate = useNavigate();
  const { getAllUsers } = useUsersApi();

  // Use the useQuery hook from React Query
  const query = useQuery({ queryKey: ["users"], staleTime: 30, queryFn: getAllUsers });

  const handleViewUser = (user: IUser) => {
    navigate(`/users/${user._id}`, { state: user });
  };

  if (query.isLoading) {
    return "Loading...";
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  console.log("query", query);
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
