import { useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { IUser } from "@/interfaces/IUser";
import useUsersQuery from "@/hooks/queries/user/useUsersQuery";
import { useStableSearchParams } from "@/hooks/useStableSearchParams";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import ErrorPage from "@/pages/ErrorPage";
import Loader from "@/components/ui/Loader";
import { weightTab } from "@/pages/UserDashboard";
import UsersCardsGrid from "@/components/users/UsersCardsGrid";
import UsersEmptyState from "@/components/users/UsersEmptyState";
import UsersPageHeader from "@/components/users/UsersPageHeader";
import UsersStatsSummary from "@/components/users/UsersStatsSummary";
import UsersToolbar from "@/components/users/UsersToolbar";
import {
  filterUsers,
  getUsersStats,
  sortUsersByFinishedDate,
} from "@/components/users/usersPageUtils";
import type { StatusFilter } from "@/components/users/usersPageTypes";

const STATUS_FILTER_VALUES: StatusFilter[] = [
  "הכל",
  "פעיל",
  "משתמשים",
  "הקפאה",
  "מסתיים בקרוב",
  "ללא תאריך סיום",
];

const parseStatusFilter = (raw: string | null): StatusFilter => {
  if (!raw) return "הכל";
  return STATUS_FILTER_VALUES.includes(raw as StatusFilter) ? (raw as StatusFilter) : "הכל";
};

export const UsersPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useUsersQuery();
  const { searchParams, setParam } = useStableSearchParams();

  const cardsScrollRef = useRef<HTMLDivElement | null>(null);
  useScrollRestoration(cardsScrollRef);

  const search = searchParams.get("q") ?? "";
  const statusFilter = parseStatusFilter(searchParams.get("status"));

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

  // URL-driven filters survive the back button — coming back from a
  // user profile restores the same search + status the trainer left
  // on. `replace: true` keeps every keystroke from spawning a new
  // history entry.
  const handleSearchChange = (value: string) => {
    setParam("q", value || null, { replace: true });
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setParam("status", value === "הכל" ? null : value, { replace: true });
  };

  if (isError) return <ErrorPage message={error.message} />;

  // Don't gate the whole page on isLoading — we need the
  // ScrollableArea (and the ref it carries) to be mounted on the
  // very first render so useScrollRestoration can attach. The
  // ResizeObserver inside the hook will re-apply the saved scroll
  // position as the cards stream in. Otherwise the back button
  // lands at scrollTop=0 because the ref was null during loading.
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
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
      />
      <UsersCardsGrid ref={cardsScrollRef} users={filteredUsers} onViewUser={handleViewUser} />
      {isLoading && <Loader size="large" />}
      {!isLoading && filteredUsers.length === 0 && <UsersEmptyState />}
    </div>
  );
};
