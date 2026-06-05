/**
 * UserCheckIn — unified attention card on the home dashboard.
 *
 * Clean, monochrome design with pill tabs in the header row:
 *   Default: "לבדיקה" · "ללא אימון" · "ללא תזונה" · "מסיימים"
 *
 * Features:
 *   - Search field filters the active list by name.
 *   - Tabs + search sit in the header — compact, no extra rows.
 *   - Colour is kept minimal: only the active pill gets a subtle
 *     slate fill, everything else is neutral. No rainbow.
 */
import { useState, useMemo } from "react";
import { UsersCheckIn } from "@/interfaces/IAnalytics";
import { useNavigate } from "react-router-dom";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import Loader from "../ui/Loader";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { FaCheck, FaArrowLeft, FaMagnifyingGlass } from "react-icons/fa6";
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

const TABS: { view: ActiveView; label: string }[] = [
  { view: "checkin", label: "לבדיקה" },
  { view: "noWorkout", label: "ללא אימון" },
  { view: "noDiet", label: "ללא תזונה" },
  { view: "expiring", label: "מסיימים" },
];

const UserCheckIn = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getAllCheckInUsers, checkOffUser, getUsersWithoutPlans, getUsersExpringThisMonth } =
    useAnalyticsApi();
  const [activeView, setActiveView] = useState<ActiveView>("checkin");
  const [search, setSearch] = useState("");

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
      toast.success("סומן כנבדק");
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

  const rawList: { _id: string; firstName?: string; lastName?: string; navUrl: string }[] =
    activeView === "checkin"
      ? (checkinUsers ?? []).map((u) => ({ ...u, navUrl: `/users/${u._id}?tab=${weightTab}` }))
      : activeView === "noWorkout"
        ? (noWorkoutData?.data ?? []).map((u: any) => ({ ...u, navUrl: `/workout-plans/${u._id}` }))
        : activeView === "noDiet"
          ? (noDietData?.data ?? []).map((u: any) => ({ ...u, navUrl: `/diet-plans/${u._id}` }))
          : (expiringData?.data ?? []).map((u: any) => ({
              ...u,
              navUrl: `/users/${u._id}?tab=${weightTab}`,
            }));

  const activeList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rawList;
    return rawList.filter(
      (u) => u.firstName?.toLowerCase().includes(q) || u.lastName?.toLowerCase().includes(q)
    );
  }, [rawList, search]);

  if (isError) return <ErrorPage message={error?.message} />;

  return (
    <section
      dir="rtl"
      className="flex h-full max-h-[75vh] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Header: tabs + search — all in one compact row */}
      <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
        {/* Search — right side in RTL */}
        <div className="relative min-w-[140px] max-w-[200px]">
          <FaMagnifyingGlass
            size={10}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש…"
            className="h-8 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pr-7 pl-2 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
          />
        </div>

        {/* Spacer pushes pills to the left in RTL */}
        <div className="flex-1" />

        {/* Pill tabs — left side in RTL */}
        {TABS.map((tab) => {
          const active = activeView === tab.view;
          const count = counts[tab.view];
          return (
            <button
              key={tab.view}
              type="button"
              onClick={() => {
                setActiveView(tab.view);
                setSearch("");
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  active
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader size="large" />
          </div>
        )}
        {!isLoading && activeList.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
              <FaCheck size={18} />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {search
                ? "לא נמצאו תוצאות"
                : activeView === "checkin"
                  ? "כל המתאמנים נבדקו!"
                  : "הכל מסודר!"}
            </p>
          </div>
        )}
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {activeList.map((user) => (
            <li
              key={user._id}
              onClick={() => navigate(user.navUrl)}
              className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-200">
                {getInitials(user.firstName, user.lastName)}
              </div>
              <span className="flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
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
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 disabled:opacity-50"
                >
                  <FaCheck size={10} />
                </button>
              )}
              <FaArrowLeft
                size={9}
                className="shrink-0 text-slate-300 dark:text-slate-600 transition-all group-hover:-translate-x-0.5 group-hover:text-slate-500"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default UserCheckIn;
