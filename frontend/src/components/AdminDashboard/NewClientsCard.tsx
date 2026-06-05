/**
 * NewClientsCard — shows active clients who are missing BOTH a workout
 * plan AND a diet plan. These are typically newly onboarded clients
 * that still need their programmes built.
 *
 * Data is derived by cross-referencing the two already-cached analytics
 * queries (no extra API call). The card matches the UserCheckIn height
 * so they sit side-by-side on the home dashboard.
 */
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAnalyticsApi from "@/hooks/api/useAnalyticsApi";
import { QueryKeys } from "@/enums/QueryKeys";
import { HOUR_STALE_TIME } from "@/constants/constants";
import { userFullName } from "@/lib/utils";
import Loader from "../ui/Loader";
import {
  FaUserPlus,
  FaArrowLeft,
  FaDumbbell,
  FaAppleWhole,
  FaCheck,
} from "react-icons/fa6";

const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName?.[0] || "";
  const l = lastName?.[0] || "";
  return (f + l).toUpperCase() || "?";
};

const NewClientsCard: React.FC = () => {
  const navigate = useNavigate();
  const { getUsersWithoutPlans } = useAnalyticsApi();

  const { data: noWorkout, isLoading: loadingW } = useQuery({
    queryFn: () => getUsersWithoutPlans("workoutPlan"),
    queryKey: [QueryKeys.NO_WORKOUT_PLAN],
    staleTime: HOUR_STALE_TIME * 6,
  });

  const { data: noDiet, isLoading: loadingD } = useQuery({
    queryFn: () => getUsersWithoutPlans("dietPlan"),
    queryKey: [QueryKeys.NO_DIET_PLAN],
    staleTime: HOUR_STALE_TIME * 6,
  });

  const isLoading = loadingW || loadingD;

  /**
   * Cross-reference: clients who appear in BOTH "no workout" AND
   * "no diet" lists → they're new and need full programme setup.
   */
  const newClients = useMemo(() => {
    if (!noWorkout?.data || !noDiet?.data) return [];
    const noDietIds = new Set(noDiet.data.map((u: any) => u._id));
    return noWorkout.data.filter((u: any) => noDietIds.has(u._id));
  }, [noWorkout?.data, noDiet?.data]);

  return (
    <section
      dir="rtl"
      className="flex h-full max-h-[75vh] flex-col overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 shadow-sm"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-amber-100 dark:border-amber-900/40 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 ring-1 ring-amber-200/60 dark:ring-amber-900/40">
            <FaUserPlus size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              לקוחות חדשים ללא תוכנית
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              צריכים גם תפריט תזונה וגם תוכנית אימונים
            </p>
          </div>
        </div>
        {!isLoading && newClients.length > 0 && (
          <span className="inline-flex h-7 min-w-[2rem] items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 text-xs font-bold text-amber-700 dark:text-amber-300">
            {newClients.length}
          </span>
        )}
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading && (
          <div className="flex justify-center py-6">
            <Loader size="large" />
          </div>
        )}
        {!isLoading && newClients.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300">
              <FaCheck size={20} />
            </div>
            <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
              כל הלקוחות מוגדרים!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              אין לקוחות שחסר להם גם תפריט וגם אימון.
            </p>
          </div>
        )}
        <ul className="flex flex-col gap-1.5">
          {newClients.map((user: any) => (
            <li
              key={user._id}
              onClick={() => navigate(`/users/${user._id}`)}
              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 px-3 py-3 transition-all hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-white shadow-sm">
                {getInitials(user.firstName, user.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {userFullName(user)}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 dark:border-purple-900/60 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                    <FaDumbbell size={8} />
                    ללא אימון
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    <FaAppleWhole size={8} />
                    ללא תזונה
                  </span>
                </div>
              </div>
              <FaArrowLeft
                size={10}
                className="shrink-0 text-slate-300 dark:text-slate-600 transition-all group-hover:-translate-x-0.5 group-hover:text-amber-600"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default NewClientsCard;
