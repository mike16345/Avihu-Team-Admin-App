export interface IBaseUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subTrainerId?: string;
  dietaryType?: string[];
  dateFinished: Date;
  planType: string;
  remindIn: number;
}

/**
 * Account status — drives access AND surfacing in attention lists.
 * - "active"   — paying client, full app access, shows in dashboards
 * - "user"     — registered user, has app access, hidden from
 *                attention lists (e.g. contract ended)
 * - "disabled" — blocked, no app access
 * - "frozen"   — temporary pause: app access KEPT, hidden from
 *                attention lists. Trainer can capture the days
 *                remaining at freeze time so they can be honoured
 *                when the client returns.
 */
export type AccountStatus = "active" | "user" | "disabled" | "frozen";

export interface IUser extends IBaseUser {
  _id?: string;
  dateJoined: Date;
  isChecked: boolean;
  checkInAt: number;
  hasAccess: boolean;
  onboardingCompleted: boolean;
  accountStatus?: AccountStatus;
  /**
   * Freeze snapshot — captured when the trainer marks the trainee
   * as "frozen". Lets the trainer see "this client was frozen with
   * 42 days of coaching remaining" months later, even if they
   * un-freeze and the calendar moves on.
   */
  frozenAt?: Date | string;
  /** Days between dateFinished and frozenAt at the moment of freeze. */
  frozenDaysRemaining?: number;
  /**
   * Full chronological log of every account-status change. Each
   * entry records WHO changed it, WHEN, FROM what status, TO what
   * status, and (for freeze events) the days that were preserved.
   * The trainer sees this in the "היסטוריית סטטוסים" section of
   * the profile.
   */
  statusHistory?: IStatusHistoryEntry[];
}

export interface IStatusHistoryEntry {
  /** ISO timestamp of the change. */
  at: Date | string;
  fromStatus: AccountStatus;
  toStatus: AccountStatus;
  /** Trainer who made the change (sub-trainer id or main trainer id). */
  changedBy?: string;
  /**
   * Days remaining at the moment of freeze (captured when
   * transitioning *into* frozen). Empty for non-freeze events.
   */
  frozenDaysRemaining?: number;
  /**
   * When *leaving* frozen, the number of days we extended
   * dateFinished by (= frozenDaysRemaining of the matching freeze).
   * Lets the trainer see "we added 42 days back to the contract".
   */
  daysAdded?: number;
}

export interface IUserPost extends IBaseUser {}
