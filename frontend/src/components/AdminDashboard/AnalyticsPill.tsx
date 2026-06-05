/**
 * AnalyticsPill — compact alert badge that replaces the full-size
 * AnalyticsCard on the home dashboard. Shows a count + label; clicking
 * it pops open a small scrollable list of the affected users.
 *
 * Much less dominant than a card — sits in a horizontal row with its
 * siblings so the trainer can scan all three numbers at a glance.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import { QueryKeys } from "@/enums/QueryKeys";
import { HOUR_STALE_TIME } from "@/constants/constants";
import { weightTab } from "@/pages/UserDashboard";
import { userFullName } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaArrowLeft } from "react-icons/fa6";
import Loader from "../ui/Loader";

interface AnalyticsPillProps {
  icon: React.ReactNode;
  label: string;
  dataKey: string;
  /** Tailwind classes for the pill colour when there ARE items. */
  activeBg: string;
  activeText: string;
  activeRing: string;
}

const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName?.[0] || "";
  const l = lastName?.[0] || "";
  return (f + l).toUpperCase() || "?";
};

const AnalyticsPill: React.FC<AnalyticsPillProps> = ({
  icon,
  label,
  dataKey,
  activeBg,
  activeText,
  activeRing,
}) => {
  const navigate = useNavigate();
  const { getUsersWithoutPlans, getUsersExpringThisMonth } = useAnalyticsApi();
  const [open, setOpen] = useState(false);

  const actions: Record<string, any> = {
    [QueryKeys.NO_WORKOUT_PLAN]: {
      key: "workoutPlan",
      queryFunc: getUsersWithoutPlans,
      navUrl: "/workout-plans/",
    },
    [QueryKeys.NO_DIET_PLAN]: {
      key: "dietPlan",
      queryFunc: getUsersWithoutPlans,
      navUrl: "/diet-plans/",
    },
    [QueryKeys.EXPIRING_USERS]: {
      key: "expiringUsers",
      queryFunc: getUsersExpringThisMonth,
      navUrl: "/users/",
      query: `?tab=${weightTab}`,
    },
  };

  const action = actions[dataKey];

  const { data, isLoading } = useQuery({
    queryFn: () => action.queryFunc(action.key),
    queryKey: [dataKey],
    enabled: !!action,
    staleTime: HOUR_STALE_TIME * 6,
  });

  const count = data?.data?.length ?? 0;
  const hasItems = count > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          dir="rtl"
          className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
            hasItems
              ? `${activeBg} ${activeText} ${activeRing} shadow-sm`
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400"
          }`}
          style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
        >
          <span className="text-base">{icon}</span>
          <span>{label}</span>
          <span
            className={`inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-xs font-bold ${
              hasItems
                ? "bg-white/80 dark:bg-slate-900/80 " + activeText
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            {isLoading ? "…" : count}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        dir="rtl"
        className="w-72 max-h-80 overflow-y-auto rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 shadow-lg"
        style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
        align="start"
      >
        <div className="sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {label}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {count} {count === 1 ? "מתאמן" : "מתאמנים"}
          </p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader />
          </div>
        ) : count === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">הכל מסודר 🎉</p>
        ) : (
          <ul className="p-2">
            {data?.data.map((item: any, i: number) => (
              <li
                key={item._id || i}
                onClick={() => {
                  setOpen(false);
                  navigate(
                    `${action.navUrl}${item._id}${action.query || ""}`
                  );
                }}
                className="group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-right transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-[10px] font-bold text-white">
                  {getInitials(item?.firstName, item?.lastName)}
                </div>
                <span className="flex-1 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {userFullName(item)}
                </span>
                <FaArrowLeft
                  size={9}
                  className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500"
                />
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default AnalyticsPill;
