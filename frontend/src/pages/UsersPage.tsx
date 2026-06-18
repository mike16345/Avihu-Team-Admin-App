import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { IUser } from "@/interfaces/IUser";
import useUsersQuery from "@/hooks/queries/user/useUsersQuery";
import ErrorPage from "@/pages/ErrorPage";
import Loader from "@/components/ui/Loader";
import { weightTab } from "@/pages/UserDashboard";
import UsersCardsGrid from "@/components/users/UsersCardsGrid";
import UsersEmptyState from "@/components/users/UsersEmptyState";
import UsersPageHeader from "@/components/users/UsersPageHeader";
import UsersStatsSummary from "@/components/users/UsersStatsSummary";
import UsersToolbar from "@/components/users/UsersToolbar";
import { filterUsers, getUsersStats, sortUsersByFinishedDate } from "@/components/users/usersPageUtils";
import type { StatusFilter } from "@/components/users/usersPageTypes";

export const UsersPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useUsersQuery();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("הכל");

  const sortedUsers = useMemo(() => sortUsersByFinishedDate(data), [data]);
  const filteredUsers = useMemo(
    () => filterUsers(sortedUsers, search, statusFilter),
    [sortedUsers, search, statusFilter]
  );
  const stats = useMemo(() => getUsersStats(sortedUsers), [sortedUsers]);

  const handleAddUser = () => {
    navigate("/users/add");
  };

  const handleViewUser = (user: IUser) => {
    navigate(`/users/${user._id}?tab=${weightTab}`, { state: user });
  };

  if (isLoading) return <Loader size="large" />;

  if (isError) return <ErrorPage message={error.message} />;

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-5"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      <UsersPageHeader onAddUser={handleAddUser} />
      <UsersStatsSummary stats={stats} />
      <UsersToolbar
        search={search}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatusFilter}
      />
      <UsersCardsGrid users={filteredUsers} onViewUser={handleViewUser} />
      {filteredUsers.length === 0 && <UsersEmptyState />}
    </div>
  );
};
