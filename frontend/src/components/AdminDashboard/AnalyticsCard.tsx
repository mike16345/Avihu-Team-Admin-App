/**
 * AnalyticsCard — a single analytics list shown inside the home
 * dashboard carousel. Tone is derived from the data key so each
 * insight has a distinct visual identity.
 *
 * Visual refresh:
 *  - Card matches the new design language (Heebo, rounded-2xl, slate
 *    borders, colored icon header, count badge).
 *  - Rows are single-click-to-open instead of double-click (more
 *    discoverable).
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import Loader from "../ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { QueryKeys } from "@/enums/QueryKeys";
import { HOUR_STALE_TIME } from "@/constants/constants";
import { weightTab } from "@/pages/UserDashboard";
import { userFullName } from "@/lib/utils";
import { FaDumbbell, FaAppleWhole, FaCalendarXmark, FaArrowLeft, FaCheck } from "react-icons/fa6";

interface AnalyticsCardProps {
  title: string;
  dataKey: string;
}

const KEY_META: Record<
  string,
  {
    icon: React.ReactNode;
    bg: string;
    text: string;
    ring: string;
    countBg: string;
    countText: string;
  }
> = {
  [QueryKeys.NO_WORKOUT_PLAN]: {
    icon: <FaDumbbell size={16} />,
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-600 dark:text-purple-300",
    ring: "ring-purple-200/60 dark:ring-purple-900/40",
    countBg: "bg-purple-100 dark:bg-purple-900/40",
    countText: "text-purple-700 dark:text-purple-300",
  },
  [QueryKeys.NO_DIET_PLAN]: {
    icon: <FaAppleWhole size={16} />,
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-200/60 dark:ring-emerald-900/40",
    countBg: "bg-emerald-100 dark:bg-emerald-900/40",
    countText: "text-emerald-700 dark:text-emerald-300",
  },
  [QueryKeys.EXPIRING_USERS]: {
    icon: <FaCalendarXmark size={16} />,
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-600 dark:text-rose-300",
    ring: "ring-rose-200/60 dark:ring-rose-900/40",
    countBg: "bg-rose-100 dark:bg-rose-900/40",
    countText: "text-rose-700 dark:text-rose-300",
  },
};

const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName?.[0] || "";
  const l = lastName?.[0] || "";
  return (f + l).toUpperCase() || "?";
};

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, dataKey }) => {
  const navigate = useNavigate();
  const { getUsersWithoutPlans, getUsersExpringThisMonth } = useAnalyticsApi();

  const actions: any = {
    [QueryKeys.NO_WORKOUT_PLAN]: {
      key: "workoutPlan",
      queryFunc: getUsersWithoutPlans,
      navUrl: `/workout-plans/`,
    },
    [QueryKeys.NO_DIET_PLAN]: {
      key: "dietPlan",
      queryFunc: getUsersWithoutPlans,
      navUrl: `/diet-plans/`,
    },
    [QueryKeys.EXPIRING_USERS]: {
      key: "expiringUsers",
      queryFunc: getUsersExpringThisMonth,
      navUrl: `/users/`,
      query: `?tab=${weightTab}`,
    },
  };

  const { data, error, isError, isLoading } = useQuery({
    queryFn: () => actions[dataKey].queryFunc(actions[dataKey].key),
    queryKey: [dataKey],
    enabled: !!actions[dataKey],
    staleTime: HOUR_STALE_TIME * 6,
  });

  const meta = KEY_META[dataKey] || KEY_META[QueryKeys.NO_WORKOUT_PLAN];
  const count = data?.data?.length ?? 0;

  return (
    <section
      dir="rtl"
      className="flex h-full max-h-[75vh] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${meta.bg} ${meta.text} ${meta.ring}`}
          >
            {meta.icon}
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        {!isLoading && (
          <span
            className={`inline-flex h-7 min-w-[2rem] items-center justify-center rounded-full px-2.5 text-xs font-bold ${meta.countBg} ${meta.countText}`}
          >
            {count}
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {isError && <ErrorPage message={error?.message} />}
        {isLoading && (
          <div className="flex justify-center py-6">
            <Loader size="large" />
          </div>
        )}
        {data?.data.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300">
              <FaCheck size={20} />
            </div>
            <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
              אין נתונים להצגה
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">הכל מסודר!</p>
          </div>
        )}
        <ul className="flex flex-col gap-1">
          {data?.data.map((item: any, i: number) => (
            <li
              key={item._id || i}
              onClick={() =>
                navigate(`${actions[dataKey]?.navUrl}${item._id}${actions[dataKey].query || ""}`)
              }
              className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-xs font-bold text-white shadow-sm">
                {getInitials(item?.firstName, item?.lastName)}
              </div>
              <span className="flex-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {userFullName(item)}
              </span>
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

export default AnalyticsCard;
