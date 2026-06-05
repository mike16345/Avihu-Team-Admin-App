/**
 * UserCheckIn — unified "attention" card on the home dashboard.
 *
 * The pill row at the top acts as a tab bar:
 *   - Default: "מתאמנים לבדיקה" (weekly check-in list with ✓ buttons)
 *   - "ללא אימון": clients without a workout plan
 *   - "ללא תזונה": clients without a diet plan
 *   - "מסיימים החודש": clients whose cycle ends this month
 *
 * Clicking a pill switches the list below it. Clicking the active pill
 * returns to the default check-in view.
 */
import { useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorPage from "@/pages/ErrorPage";
import { FULL_DAY_STALE_TIME, HOUR_STALE_TIME } from "@/constants/constants";
import { weightTab } from "@/pages/UserDashboard";
import { QueryKeys } from "@/enums/QueryKeys";
import { userFullName } from "@/lib/utils";

type ActiveView = "checkin" | "noWorkout" | "noDiet" | "expiring";

const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName?.[0] || "";
  const l = lastName?.[0] || "";
  return (f + l).toUpperCase() || "?";
};

const VIEW_META: Record<
  ActiveView,
  { label: string; icon: React.ReactNode; bg: string; text: string; ring: string; countBg: string }
> = {
  checkin: {
    label: "לבדיקה שבועית",
    icon: <FaUserCheck size={16} />,
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-300",
    ring: "ring-amber-200/60 dark:ring-amber-900/40",
    countBg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  },
  noWorkout: {
    label: "ללא תוכנית אימון",
    icon: <FaDumbbell size={16} />,
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-600 dark:text-purple-300",
    ring: "ring-purple-200/60 dark:ring-purple-900/40",
    countBg: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
  },
  noDiet: {
    label: "ללא תפריט תזונה",
    icon: <FaAppleWhole size={16} />,
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-200/60 dark:ring-emerald-900/40",
    countBg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  },
  expiring: {
    label: "מסיימים החודש",
    icon: <FaCalendarXmark size={16} />,
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-600 dark:text-rose-300",
    ring: "ring-rose-200/60 dark:ring-rose-900/40",
    countBg: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
  },
};

const PILL_DEFS: {
  view: ActiveView;
  icon: React.ReactNode;
  label: string;
  pillBg: string;
  pillText: string;
  pillRing: string;
}[] = [
  {
    view: "checkin",
    icon: <FaUserCheck size={13} />,
    label: "לבדיקה",
    pillBg: "bg-amber-50 dark:bg-amber-950/40",
    pillText: "text-amber-700 dark:text-amber-300",
    pillRing: "border-amber-300 dark:border-amber-700",
  },
  {
    view: "noWorkout",
    icon: <FaDumbbell size={13} />,
    label: "ללא אימון",
    pillBg: "bg-purple-50 dark:bg-purple-950/40",
    pillText: "text-purple-700 dark:text-purple-300",
    pillRing: "border-purple-300 dark:border-purple-700",
  },
  {
    view: "noDiet",
    icon: <FaAppleWhole size={13} />,
    label: "ללא תזונה",
    pillBg: "bg-emerald-50 dark:bg-emerald-950/40",
    pillText: "text-emerald-700 dark:text-emerald-300",
    pillRing: "border-emerald-300 dark:border-emerald-700",
  },
  {
    view: "expiring",
    icon: <FaCalendarXmark size={13} />,
    label: "מסיימים",
    pillBg: "bg-rose-50 dark:bg-rose-950/40",
    pillText: "text-rose-700 dark:text-rose-300",
    pillRing: "border-rose-300 dark:border-rose-700",
  },
];

const UserCheckIn = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getAllCheckInUsers, checkOffUser, getUsersWithoutPlans, getUsersExpringThisMonth } =
    useAnalyticsApi();
  const [activeView, setActiveView] = useState<ActiveView>("checkin");

  // ---------- queries ----------
  const {
    isLoading: loadingCheckin,
    isError,
    error,
    data: checkinUsers,
  } = useQuery({
    queryKey: [QueryKeys.USERS_TO_CHECK],
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: getAllCheckInUsers,
  });

  const { data: noWorkoutData, isLoading: loadingW } = useQuery({
    queryFn: () => getUsersWithoutPlans("workoutPlan"),
    queryKey: [QueryKeys.NO_WORKOUT_PLAN],
    staleTime: HOUR_STALE_TIME * 6,
  });

  const { data: noDietData, isLoading: loadingD } = useQuery({
    queryFn: () => getUsersWithoutPlans("dietPlan"),
    queryKey: [QueryKeys.NO_DIET_PLAN],
    staleTime: HOUR_STALE_TIME * 6,
  });

  const { data: expiringData, isLoading: loadingE } = useQuery({
    queryFn: () => getUsersExpringThisMonth(),
    queryKey: [QueryKeys.EXPIRING_USERS],
    staleTime: HOUR_STALE_TIME * 6,
  });

  const checkMutation = useMutation({
    mutationFn: (id: string) => checkOffUser(id).then((res) => res.data),
    onSuccess: (data) => {
      toast.success("המתאמן סומן כנבדק");
      queryClient.setQueryData<UsersCheckIn[] | undefined>(
        [QueryKeys.USERS_TO_CHECK],
        (old) => old?.filter((u) => u._id !== data._id) ?? []
      );
    },
    onError: (err: any) => {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
        description: err.response?.data?.message || "",
      });
    },
  });

  // ---------- derived ----------
  const counts: Record<ActiveView, number> = {
    checkin: checkinUsers?.length ?? 0,
    noWorkout: noWorkoutData?.data?.length ?? 0,
    noDiet: noDietData?.data?.length ?? 0,
    expiring: expiringData?.data?.length ?? 0,
  };

  const isLoading =
    (activeView === "checkin" && loadingCheckin) ||
    (activeView === "noWorkout" && loadingW) ||
    (activeView === "noDiet" && loadingD) ||
    (activeView === "expiring" && loadingE);

  /** The list to render, based on the active pill. */
  const activeList: { _id: string; firstName?: string; lastName?: string; navUrl: string }[] =
    activeView === "checkin"
      ? (checkinUsers ?? []).map((u) => ({
          ...u,
          navUrl: `/users/${u._id}?tab=${weightTab}`,
        }))
      : activeView === "noWorkout"
      ? (noWorkoutData?.data ?? []).map((u: any) => ({
          ...u,
          navUrl: `/workout-plans/${u._id}`,
        }))
      : activeView === "noDiet"
      ? (noDietData?.data ?? []).map((u: any) => ({
          ...u,
          navUrl: `/diet-plans/${u._id}`,
        }))
      : (expiringData?.data ?? []).map((u: any) => ({
          ...u,
          navUrl: `/users/${u._id}?tab=${weightTab}`,
        }));

  const meta = VIEW_META[activeView];

  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <section
      dir="rtl"
      className="flex h-full max-h-[75vh] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Dynamic header — changes colour + label per active view */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${meta.bg} ${meta.text} ${meta.ring}`}
          >
            {meta.icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {meta.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeView === "checkin"
                ? "לחץ על שם כדי לפתוח פרופיל, או על ה-V כדי לסמן כנבדק"
                : "לחץ על שם כדי לפתוח את הפרופיל"}
            </p>
          </div>
        </div>
        <span className={`inline-flex h-7 min-w-[2rem] items-center justify-center rounded-full px-2.5 text-xs font-bold ${meta.countBg}`}>
          {counts[activeView]}
        </span>
      </header>

      {/* Pill tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-100 dark:border-slate-800 px-5 py-3">
        {PILL_DEFS.map((pill) => {
          const active = activeView === pill.view;
          return (
            <button
              key={pill.view}
              type="button"
              onClick={() => setActiveView(pill.view)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                active
                  ? `${pill.pillBg} ${pill.pillText} ${pill.pillRing} shadow-sm`
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              {pill.icon}
              <span>{pill.label}</span>
              <span
                className={`inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                  active
                    ? "bg-white/80 dark:bg-slate-900/80 " + pill.pillText
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {counts[pill.view]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Body — the list switches per active view */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Loader size="large" />
          </div>
        )}
        {!isLoading && activeList.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300">
              <FaCheck size={20} />
            </div>
            <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
              {activeView === "checkin" ? "כל המתאמנים נבדקו!" : "הכל מסודר!"}
            </p>
          </div>
        )}
        <ul className="flex flex-col gap-1">
          {activeList.map((user) => (
            <li
              key={user._id}
              onClick={() => navigate(user.navUrl)}
              className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white shadow-sm">
                {getInitials(user.firstName, user.lastName)}
              </div>
              <span className="flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {activeView === "checkin"
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  : userFullName(user)}
              </span>
              {activeView === "checkin" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    checkMutation.mutate(user._id);
                  }}
                  disabled={checkMutation.isPending}
                  aria-label="סמן כנבדק"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                >
                  <FaCheck size={11} />
                </button>
              )}
              <FaArrowLeft
                size={10}
                className="shrink-0 text-slate-300 dark:text-slate-600 transition-all group-hover:-translate-x-0.5 group-hover:text-blue-500"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default UserCheckIn;
