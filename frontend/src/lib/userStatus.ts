import type { AccountStatus, IUser } from "@/interfaces/IUser";

export const hasContractEnded = (user: Pick<IUser, "dateFinished"> | undefined): boolean => {
  if (!user?.dateFinished) return false;
  const finished = new Date(user.dateFinished).getTime();

  if (Number.isNaN(finished)) return false;

  return finished < Date.now();
};

export const deriveAccountStatus = (user: IUser | undefined): AccountStatus => {
  if (!user) return "active";

  let base: AccountStatus = "active";

  if (user.accountStatus) {
    base = user.accountStatus;
  } else if (user.hasAccess === false) {
    base = "disabled";
  }

  if (base === "disabled") return "disabled";

  // Frozen users were paused intentionally; dateFinished should not auto-downgrade them.
  if (base === "frozen") return "frozen";

  // Expired active users are filtered out of active coaching lists without writing to the DB.
  if (base === "active" && hasContractEnded(user)) return "user";

  return base;
};

export const isUserActive = (user: IUser | undefined): boolean =>
  deriveAccountStatus(user) === "active";
