import { useUsersApi } from "@/hooks/api/useUsersApi";
import { IUser } from "@/interfaces/IUser";
import { columns as userColumns } from "./Columns/Users/UserColumns";
import { DataTableHebrew } from "./DataTableHebrew";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MIN_STALE_TIME } from "@/constants/constants";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";

export const UsersTable = () => {
  const navigate = useNavigate();
  const { getAllUsers, deleteUser } = useUsersApi();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    staleTime: MIN_STALE_TIME,
    queryFn: getAllUsers,
  });

  const usersMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("המשתמש נמחק בהצלחה!");
      queryClient.invalidateQueries({ queryKey: [`users`] });
    },
    onError: () => toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE),
  });

  const handleViewUser = (user: IUser) => {
    navigate(`/users/${user._id}`, { state: user });
  };

  if (isLoading) return <Loader size="large" />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <>
      <DataTableHebrew
        data={data || []}
        columns={userColumns}
        actionButton={<Button onClick={() => navigate(`/users/add`)}>הוסף משתמש</Button>}
        handleSetData={() => console.log("setting data")}
        handleViewData={(user) => handleViewUser(user)}
        handleDeleteData={(user) => usersMutation.mutate(user._id || "")}
        handleViewNestedData={(data, userId) => console.log("data user", data, userId)}
      />
    </>
  );
};
