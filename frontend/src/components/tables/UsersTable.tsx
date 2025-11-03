import { IUser } from "@/interfaces/IUser";
import { columns as userColumns } from "./Columns/Users/UserColumns";
import { DataTableHebrew } from "./DataTableHebrew";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import DateUtils from "@/lib/dateUtils";
import { useTheme } from "../theme/theme-provider";
import { weightTab } from "@/pages/UserDashboard";
import useUsersQuery from "@/hooks/queries/user/useUsersQuery";
import useDeleteUser from "@/hooks/mutations/User/useDeleteUser";

export const UsersTable = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data, isLoading, isError, error } = useUsersQuery();

  const usersMutation = useDeleteUser();

  const handleViewUser = (user: IUser) => {
    navigate(`/users/${user._id}?tab=${weightTab}`, { state: user });
  };

  const handleGetRowClassName = (user: IUser) => {
    const MINIMUM_WARNING_DAYS = 3;
    const daysUntilPlanIsFinished = DateUtils.getDaysDifference(new Date(), user.dateFinished);

    if (daysUntilPlanIsFinished <= MINIMUM_WARNING_DAYS) {
      return theme == "dark" ? " bg-red-400/95" : "bg-red-300/50";
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
        actionButton={
          <Button onClick={() => navigate(`/users/add`)} data-testid="nav-users-add-link">
            הוסף משתמש
          </Button>
        }
        handleSetData={() => {}}
        handleViewData={(user) => handleViewUser(user)}
        handleDeleteData={(user) => usersMutation.mutate(user._id || "")}
        handleViewNestedData={(_, userId) => navigate(`/users/${userId}?tab=${weightTab}`)}
        getRowClassName={(user) => handleGetRowClassName(user)}
      />
    </>
  );
};
