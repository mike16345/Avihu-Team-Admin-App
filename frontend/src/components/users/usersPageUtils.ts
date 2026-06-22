import { IUser } from "@/interfaces/IUser";
import DateUtils from "@/lib/dateUtils";
import { deriveAccountStatus } from "@/lib/userStatus";
import { MINIMUM_WARNING_DAYS } from "./usersPageConstants";
import type { StatusFilter, UsersStats } from "./usersPageTypes";

export const sortUsersByFinishedDate = (users: IUser[] | undefined) => {
  if (!users) return [];

  return [...users].sort((firstUser, secondUser) => {
    const firstHasDate = !!firstUser.dateFinished;
    const secondHasDate = !!secondUser.dateFinished;

    if (firstHasDate && !secondHasDate) return -1;
    if (!firstHasDate && secondHasDate) return 1;

    if (firstHasDate && secondHasDate) {
      return (
        new Date(secondUser.dateFinished!).getTime() - new Date(firstUser.dateFinished!).getTime()
      );
    }

    return 0;
  });
};

export const filterUsers = (users: IUser[], search: string, statusFilter: StatusFilter) => {
  const normalizedSearch = search.toLowerCase().trim();

  return users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(normalizedSearch) ||
      user.planType?.toLowerCase().includes(normalizedSearch) ||
      user.email?.toLowerCase().includes(normalizedSearch) ||
      user.phone?.toLowerCase().includes(normalizedSearch);

    if (!matchesSearch) return false;

    if (statusFilter === "הכל") return true;

    const daysLeft = user.dateFinished
      ? DateUtils.getDaysDifference(new Date(), user.dateFinished)
      : null;

    if (statusFilter === "מסתיים בקרוב") {
      return daysLeft !== null && daysLeft <= MINIMUM_WARNING_DAYS && daysLeft >= 0;
    }

    const accountStatus = deriveAccountStatus(user);

    if (statusFilter === "פעיל") return accountStatus === "active";
    if (statusFilter === "משתמשים") return accountStatus === "user";
    if (statusFilter === "הקפאה") return accountStatus === "frozen";
    if (statusFilter === "ללא תאריך סיום") return !user.dateFinished;

    return true;
  });
};

export const getUsersStats = (users: IUser[]): UsersStats => {
  const total = users.length;
  const active = users.filter((user) => deriveAccountStatus(user) === "active").length;
  const inOnboarding = users.filter((user) => deriveAccountStatus(user) === "user").length;
  const frozen = users.filter((user) => deriveAccountStatus(user) === "frozen").length;

  const endingSoon = users.filter((user) => {
    if (!user.dateFinished) return false;

    const daysLeft = DateUtils.getDaysDifference(new Date(), user.dateFinished);

    return daysLeft <= 7 && daysLeft >= 0;
  }).length;

  return { total, active, inOnboarding, frozen, endingSoon };
};

export const getUserInitials = (user: Pick<IUser, "firstName" | "lastName"> | null) => {
  if (!user) return "?";

  const firstInitial = user.firstName?.trim()[0] || "";
  const lastInitial = user.lastName?.trim()[0] || "";

  const initials = (firstInitial + lastInitial).toUpperCase();

  return initials || "?";
};

export const getUserDaysLeft = (user: IUser) => {
  if (!user.dateFinished) return null;

  return DateUtils.getDaysDifference(new Date(), user.dateFinished);
};

export const getUserStatusLabel = (user: IUser) => {
  const accountStatus = deriveAccountStatus(user);

  if (accountStatus === "active") return "פעיל";
  if (accountStatus === "user") return "משתמש";
  if (accountStatus === "frozen") return "הקפאה";

  return "כבוי";
};

export const getUserStatusColors = (user: IUser) => {
  const accountStatus = deriveAccountStatus(user);

  if (accountStatus === "disabled") {
    return {
      dot: "bg-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-700 dark:text-rose-300",
    };
  }

  if (accountStatus === "user") {
    return {
      dot: "bg-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-300",
    };
  }

  if (accountStatus === "frozen") {
    return {
      dot: "bg-cyan-500",
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
      text: "text-cyan-700 dark:text-cyan-300",
    };
  }

  return {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
  };
};
