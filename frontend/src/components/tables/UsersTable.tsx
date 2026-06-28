import { useMemo } from "react";
import { useNavigate } from "react-router";
import { weightTab } from "@/pages/UserDashboard";
import { IUser } from "@/interfaces/IUser";
import useUsersQuery from "@/hooks/queries/user/useUsersQuery";
import useDeleteUser from "@/hooks/mutations/User/useDeleteUser";
import DateUtils from "@/lib/dateUtils";
import ErrorPage from "@/pages/ErrorPage";
import { columns as userColumns } from "./Columns/Users/UserColumns";
import { DataTableHebrew } from "./DataTableHebrew";
import { Button } from "../ui/button";
import Loader from "../ui/Loader";
import { useTheme } from "../theme/theme-provider";
import { MINIMUM_WARNING_DAYS } from "../users/usersPageConstants";

export const UsersTable = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const { data, isLoading, isError, error } = useUsersQuery();

  const sortedUsers = useMemo(() => {
    if (!data) return [];

    return data.sort((a, b) => {
      const aHasDate = !!a.dateFinished;
      const bHasDate = !!b.dateFinished;

      if (aHasDate && !bHasDate) return -1;
      if (!aHasDate && bHasDate) return 1;

      if (aHasDate && bHasDate) {
        return new Date(b.dateFinished!).getTime() - new Date(a.dateFinished!).getTime();
      }

      return 0;
    });
  }, [data]);

  const usersMutation = useDeleteUser();

  const handleViewUser = (user: IUser) => {
    navigate(`/users/${user._id}?tab=${weightTab}`, { state: user });
  };

  const handleGetRowClassName = (user: IUser) => {
    const daysUntilPlanIsFinished = DateUtils.getDaysDifference(new Date(), user.dateFinished);

    if (daysUntilPlanIsFinished <= MINIMUM_WARNING_DAYS && daysUntilPlanIsFinished >= 0) {
      return theme == "dark" ? " bg-red-400/95" : "bg-red-300/50";
    }

    return "";
  };

  if (isLoading) return <Loader size="large" />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <>
      <DataTableHebrew
        data={sortedUsers}
        columns={userColumns}
        actionButton={
          <Button data-testid="users-add-button" onClick={() => navigate(`/users/add`)}>
            הוסף משתמש
          </Button>
        }
        handleSetData={() => {}}
        handleViewData={(user) => handleViewUser(user)}
        getRowId={(row) => row._id || ""}
        handleDeleteData={(user) => usersMutation.mutate(user._id || "")}
        handleViewNestedData={(_, userId) => navigate(`/users/${userId}?tab=${weightTab}`)}
        getRowClassName={(user) => handleGetRowClassName(user)}
        handleHoverOnRow={(user) => {
          const daysUntilPlanIsFinished = DateUtils.getDaysDifference(
            new Date(),
            user.dateFinished
          );

          return daysUntilPlanIsFinished <= MINIMUM_WARNING_DAYS && daysUntilPlanIsFinished >= 0;
        }}
        testIdPrefix="users"
      />
    </>
  );
};
