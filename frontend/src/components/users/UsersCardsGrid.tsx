import { IUser } from "@/interfaces/IUser";
import DateUtils from "@/lib/dateUtils";
import { MINIMUM_WARNING_DAYS } from "./usersPageConstants";
import {
  getUserDaysLeft,
  getUserInitials,
  getUserStatusColors,
  getUserStatusLabel,
} from "./usersPageUtils";
import { UserAvatar } from "./UserAvatar";

type UsersCardsGridProps = {
  users: IUser[];
  onViewUser: (user: IUser) => void;
};

const getCardClassName = (isExpiringSoon: boolean) => {
  const baseClassName =
    "group relative flex flex-col gap-3 rounded-2xl border bg-white dark:bg-slate-900 p-5 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg";

  if (isExpiringSoon) {
    return `${baseClassName} border-rose-300 hover:border-rose-400`;
  }

  return `${baseClassName} border-slate-200/80 dark:border-slate-800/80 hover:border-blue-300`;
};

const UsersCardsGrid = ({ users, onViewUser }: UsersCardsGridProps) => {
  return (
    <div className="max-h-[calc(100vh-360px)] overflow-y-auto p-2 -me-2 [scrollbar-color:rgba(148,163,184,0.3)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-slate-400/30 [&::-webkit-scrollbar-thumb:hover]:bg-slate-400/50 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <UserCard key={user._id} user={user} onView={() => onViewUser(user)} />
        ))}
      </div>
    </div>
  );
};

function UserCard({ user, onView }: { user: IUser; onView: () => void }) {
  const initials = getUserInitials(user);
  const daysLeft = getUserDaysLeft(user);
  const isExpiringSoon = daysLeft !== null && daysLeft <= MINIMUM_WARNING_DAYS && daysLeft >= 0;
  const status = getUserStatusLabel(user);
  const statusColors = getUserStatusColors(user);

  return (
    <div className={getCardClassName(isExpiringSoon)}>
      <button
        onClick={onView}
        className="absolute inset-0 z-0 cursor-pointer rounded-2xl"
        aria-label={`פתח את הפרופיל של ${user.firstName} ${user.lastName}`}
      />

      <div className="relative z-10 flex items-start justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.planType || "—"}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full ${statusColors.bg} px-2 py-0.5 text-[10px] font-semibold ${statusColors.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
          {status}
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs pointer-events-none">
        <div>
          <p className="text-slate-400 dark:text-slate-500">תחילת ליווי</p>
          <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-100">
            {user.dateJoined ? DateUtils.formatDate(user.dateJoined, "DD/MM/YYYY") : "—"}
          </p>
        </div>
        <div>
          <p className="text-slate-400 dark:text-slate-500">סיום ליווי</p>
          <p
            className={`mt-0.5 font-bold ${
              isExpiringSoon ? "text-rose-600" : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {user.dateFinished ? DateUtils.formatDate(user.dateFinished, "DD/MM/YYYY") : "—"}
          </p>
        </div>
        <div>
          <p className="text-slate-400 dark:text-slate-500">טלפון</p>
          <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-100" dir="ltr">
            {user.phone || "—"}
          </p>
        </div>
        <div>
          <p className="text-slate-400 dark:text-slate-500">אימייל</p>
          <p className="mt-0.5 truncate font-bold text-slate-800 dark:text-slate-100" dir="ltr">
            {user.email || "—"}
          </p>
        </div>
      </div>

      {isExpiringSoon && (
        <div className="relative z-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 px-2 py-1 text-center text-[11px] font-semibold text-rose-700 dark:text-rose-300 pointer-events-none">
          ⚠️ הליווי מסתיים בעוד {daysLeft} ימים
        </div>
      )}

      <div className="relative z-10 flex items-center justify-end gap-2 pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
        >
          פרופיל מלא ←
        </button>
      </div>
    </div>
  );
}

export default UsersCardsGrid;
