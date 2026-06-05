/**
 * UserCheckIn — "clients to check" widget on the home dashboard.
 *
 * Visual refresh:
 *  - Rounded-2xl card with header (icon + title + count badge)
 *  - Each user is a row with avatar (initials), name, and a green check
 *    button to mark them off.
 *  - "Open profile" by clicking the row (single click, not double — old
 *    behaviour was hard to discover).
 */
import { UsersCheckIn } from "@/interfaces/IAnalytics";
import { useNavigate } from "react-router-dom";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import Loader from "../ui/Loader";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import {
  FaCheck,
  FaUserCheck,
  FaArrowLeft,
  FaDumbbell,
  FaAppleWhole,
  FaCalendarXmark,
} from "react-icons/fa6";
import AnalyticsPill from "./AnalyticsPill";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorPage from "@/pages/ErrorPage";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { weightTab } from "@/pages/UserDashboard";
import { QueryKeys } from "@/enums/QueryKeys";

const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName?.[0] || "";
  const l = lastName?.[0] || "";
  return (f + l).toUpperCase() || "?";
};

const UserCheckIn = () => {
  const navigate = useNavigate();
  const { getAllCheckInUsers, checkOffUser } = useAnalyticsApi();
  const queryClient = useQueryClient();

  const {
    isLoading,
    isError,
    error,
    data: users,
  } = useQuery({
    queryKey: [QueryKeys.USERS_TO_CHECK],
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: getAllCheckInUsers,
  });

  const mutation = useMutation({
    mutationFn: (id: string) => checkOffUser(id).then((res) => res.data),
    onSuccess: (data) => {
      toast.success("המתאמן סומן כנבדק");
      queryClient.setQueryData<UsersCheckIn[] | undefined>(
        [QueryKeys.USERS_TO_CHECK],
        (oldData) => oldData?.filter((user) => user._id !== data._id) ?? []
      );
    },
    onError: (err: any) => {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
        description: err.response?.data?.message || "An error occurred",
      });
    },
  });

  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <section
      dir="rtl"
      className="flex h-full max-h-[75vh] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 ring-1 ring-amber-200/60 dark:ring-amber-900/40">
            <FaUserCheck size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              מתאמנים לבדיקה
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              לחץ על שם כדי לפתוח פרופיל, או על ה-V כדי לסמן כנבדק
            </p>
          </div>
        </div>
        {users && users.length > 0 && (
          <span className="inline-flex h-7 min-w-[2rem] items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            {users.length}
          </span>
        )}
      </header>

      {/* Alert pills — דורשי טיפול */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-5 py-3">
        <AnalyticsPill
          icon={<FaDumbbell size={13} />}
          label="ללא אימון"
          dataKey={QueryKeys.NO_WORKOUT_PLAN}
          activeBg="bg-purple-50 dark:bg-purple-950/40"
          activeText="text-purple-700 dark:text-purple-300"
          activeRing="border-purple-300 dark:border-purple-700"
        />
        <AnalyticsPill
          icon={<FaAppleWhole size={13} />}
          label="ללא תזונה"
          dataKey={QueryKeys.NO_DIET_PLAN}
          activeBg="bg-emerald-50 dark:bg-emerald-950/40"
          activeText="text-emerald-700 dark:text-emerald-300"
          activeRing="border-emerald-300 dark:border-emerald-700"
        />
        <AnalyticsPill
          icon={<FaCalendarXmark size={13} />}
          label="מסיימים החודש"
          dataKey={QueryKeys.EXPIRING_USERS}
          activeBg="bg-rose-50 dark:bg-rose-950/40"
          activeText="text-rose-700 dark:text-rose-300"
          activeRing="border-rose-300 dark:border-rose-700"
        />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Loader size="large" />
          </div>
        )}
        {users && users.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300">
              <FaCheck size={20} />
            </div>
            <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
              כל המתאמנים נבדקו!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">תוכל לחזור מחר.</p>
          </div>
        )}
        <ul className="flex flex-col gap-1">
          {users?.map((user) => (
            <li
              key={user._id}
              onClick={() => navigate(`/users/${user._id}?tab=${weightTab}`)}
              className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white shadow-sm">
                {getInitials(user.firstName, user.lastName)}
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  mutation.mutate(user._id);
                }}
                disabled={mutation.isPending}
                aria-label={`סמן את ${user.firstName} כנבדק`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
              >
                <FaCheck size={11} />
              </button>
              <FaArrowLeft
                size={10}
                className="text-slate-300 dark:text-slate-600 transition-all group-hover:-translate-x-0.5 group-hover:text-blue-500"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default UserCheckIn;
