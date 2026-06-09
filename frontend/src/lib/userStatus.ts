/**
 * userStatus — single source of truth for "what status is this user
 * effectively in, right now?"
 *
 * Shared between UserDashboard (the per-trainee profile + header
 * dropdown) and UserCheckIn (the home-dashboard attention lists), so
 * the two views can never disagree about whether a user is "active".
 *
 * Business rule (per Avihu):
 *   1. If `accountStatus` is set, that wins.
 *   2. If `accountStatus` is missing, fall back to `hasAccess`
 *      (the legacy boolean): `false` → "disabled", otherwise "active".
 *   3. AUTO-DOWNGRADE: any user whose `dateFinished` (סיום הליווי)
 *      has passed is treated as "user" — even if the stored status
 *      says "active". The trainer no longer owes that person active
 *      coaching, so they shouldn't keep cluttering "לבדיקה" /
 *      "ללא אימון" / "ללא תזונה" lists. A user that was already
 *      "disabled" stays "disabled" — we never silently *re-enable*
 *      a disabled user just because their date passed.
 *
 * The downgrade is computed at read-time. It's not written back to
 * the DB here — that would require triggering a write on every dash
 * render, which is a footgun. UserDashboard persists the downgrade
 * when the trainer opens the profile (see `useAutoDowngradeStatus`).
 */
import type { AccountStatus, IUser } from "@/interfaces/IUser";

/** True when the user's dateFinished is in the past. Safe on missing dates. */
export const hasContractEnded = (user: Pick<IUser, "dateFinished"> | undefined): boolean => {
  if (!user?.dateFinished) return false;
  const finished = new Date(user.dateFinished).getTime();
  if (Number.isNaN(finished)) return false;
  return finished < Date.now();
};

/**
 * Returns the effective account status, applying the auto-downgrade
 * rule above. Use this everywhere status is *displayed* or *filtered*
 * on — never read `user.accountStatus` directly in feature code.
 */
export const deriveAccountStatus = (user: IUser | undefined): AccountStatus => {
  if (!user) return "active";

  // Step 1 — base status (stored value, with hasAccess fallback for
  // older docs that haven't been re-saved since accountStatus shipped).
  const base: AccountStatus = user.accountStatus
    ? user.accountStatus
    : user.hasAccess === false
      ? "disabled"
      : "active";

  // Step 2 — never re-enable a disabled user via the date rule.
  if (base === "disabled") return "disabled";

  // Step 3 — frozen is explicit. Don't auto-downgrade frozen users
  // by dateFinished — the trainer paused them on purpose; the date
  // logic shouldn't override that.
  if (base === "frozen") return "frozen";

  // Step 4 — auto-downgrade expired actives to "user".
  if (base === "active" && hasContractEnded(user)) return "user";

  return base;
};

/**
 * Convenience predicate for filtering attention lists.
 * "Active" here is the *derived* status, so expired users drop out.
 */
export const isUserActive = (user: IUser | undefined): boolean =>
  deriveAccountStatus(user) === "active";
