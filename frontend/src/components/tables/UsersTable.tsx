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
import DateUtils from "@/lib/dateUtils";
import { useTheme } from "../theme/theme-provider";
import { useUsersStore } from "@/store/userStore";
import { weightTab } from "@/pages/UserDashboard";

export const UsersTable = () => {
  const setUsers = useUsersStore((state) => state.setUsers);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { getAllUsers, deleteUser } = useUsersApi();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    staleTime: MIN_STALE_TIME,
    queryFn: () =>
      getAllUsers()
        .then((users) => {
          setUsers(users);
          return users;
        })
        .catch((err) => {
          throw err;
        }),
  });

  const usersMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("המשתמש נמחק בהצלחה!");
      queryClient.invalidateQueries({ queryKey: [`users`] });
      setUsers([]);
    },
    onError: () => toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE),
  });

  const handleViewUser = (user: IUser) => {
    navigate(`/users/${user._id}?tab=${weightTab}`, { state: user });
  };

  const handleGetRowClassName = (user: IUser) => {
    const MINIMUM_WARNING_DAYS = 3;
    const daysUntilPlanIsFinished = DateUtils.getDaysDifference(new Date(), user.dateFinished);

    if (daysUntilPlanIsFinished <= MINIMUM_WARNING_DAYS) {
      return theme == "dark" ? " bg-red-400" : "bg-red-300";
    }

    return "";
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
        getRowClassName={(user) => handleGetRowClassName(user)}
      />
    </>
  );
};
