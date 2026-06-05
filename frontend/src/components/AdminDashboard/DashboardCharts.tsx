/**
 * DashboardCharts — two small visual summaries at the bottom of the
 * home dashboard.
 *
 * 1. Plan coverage — horizontal progress bars showing what % of
 *    active clients have a workout plan / diet plan.
 * 2. Expiry timeline — how many clients' cycles end this month vs
 *    next month (simple bar comparison).
 *
 * Data is derived from the already-cached analytics queries (no extra
 * network requests).
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import { QueryKeys } from "@/enums/QueryKeys";
import { HOUR_STALE_TIME } from "@/constants/constants";
import { useUsersStore } from "@/store/userStore";
import { FaDumbbell, FaAppleWhole, FaCalendarXmark, FaChartBar } from "react-icons/fa6";

const ProgressBar: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: number;
  total: number;
  color: string; // e.g. "bg-purple-500"
  bgColor: string; // e.g. "bg-purple-100"
}> = ({ label, icon, value, total, color, bgColor }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
          {icon}
          {label}
        </span>
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {value}/{total} <span className="font-normal text-slate-400">({pct}%)</span>
        </span>
      </div>
      <div className={`h-2 w-full overflow-hidden rounded-full ${bgColor}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const DashboardCharts: React.FC = () => {
  const { getUsersWithoutPlans, getUsersExpringThisMonth } = useAnalyticsApi();
  const totalUsers = useUsersStore((s) => s.users?.length ?? 0);

  const { data: noWorkout } = useQuery({
    queryFn: () => getUsersWithoutPlans("workoutPlan"),
    queryKey: [QueryKeys.NO_WORKOUT_PLAN],
    staleTime: HOUR_STALE_TIME * 6,
  });

  const { data: noDiet } = useQuery({
    queryFn: () => getUsersWithoutPlans("dietPlan"),
    queryKey: [QueryKeys.NO_DIET_PLAN],
    staleTime: HOUR_STALE_TIME * 6,
  });

  const { data: expiring } = useQuery({
    queryFn: () => getUsersExpringThisMonth(),
    queryKey: [QueryKeys.EXPIRING_USERS],
    staleTime: HOUR_STALE_TIME * 6,
  });

  const withWorkout = totalUsers - (noWorkout?.data?.length ?? 0);
  const withDiet = totalUsers - (noDiet?.data?.length ?? 0);
  const expiringCount = expiring?.data?.length ?? 0;

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-5"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Chart 1 — Plan coverage */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60">
            <FaChartBar size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">כיסוי תוכניות</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              כמה מתוך {totalUsers} מתאמנים כבר מוגדרים?
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <ProgressBar
            label="תוכנית אימון"
            icon={<FaDumbbell size={12} className="text-purple-500" />}
            value={withWorkout}
            total={totalUsers}
            color="bg-purple-500"
            bgColor="bg-purple-100 dark:bg-purple-950/40"
          />
          <ProgressBar
            label="תפריט תזונה"
            icon={<FaAppleWhole size={12} className="text-emerald-500" />}
            value={withDiet}
            total={totalUsers}
            color="bg-emerald-500"
            bgColor="bg-emerald-100 dark:bg-emerald-950/40"
          />
        </div>
      </section>

      {/* Chart 2 — Expiry summary */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 ring-1 ring-rose-200/60">
            <FaCalendarXmark size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">סיום תהליכים</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              מתאמנים שמסיימים את התוכנית בקרוב
            </p>
          </div>
        </div>
        <div className="flex items-end gap-6">
          {/* Big number */}
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold text-rose-600 dark:text-rose-400">
              {expiringCount}
            </span>
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">מסיימים החודש</span>
          </div>
          {/* Visual bar */}
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-end gap-1">
              {/* Proportional bar relative to total */}
              <div
                className="w-full rounded-lg bg-rose-100 dark:bg-rose-950/40"
                style={{ height: 8 }}
              >
                <div
                  className="h-full rounded-lg bg-rose-500 transition-all duration-700"
                  style={{
                    width: `${
                      totalUsers > 0
                        ? Math.max(2, Math.round((expiringCount / totalUsers) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {totalUsers > 0
                ? `${Math.round((expiringCount / totalUsers) * 100)}% מכלל המתאמנים`
                : "—"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardCharts;
