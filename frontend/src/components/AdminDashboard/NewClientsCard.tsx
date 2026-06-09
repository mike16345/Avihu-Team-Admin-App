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
import { FaUserPlus, FaDumbbell, FaAppleWhole, FaCheck } from "react-icons/fa6";
import { useUsersStore } from "@/store/userStore";
import useUsersQuery from "@/hooks/queries/user/useUsersQuery";
import { deriveAccountStatus, hasContractEnded } from "@/lib/userStatus";

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

  // We also need the users store so we can gate the cross-reference
  // by accountStatus + dateFinished. Trigger the query — it's react-
  // query-cached so this is a no-op if another page already fetched.
  useUsersQuery();
  const allUsers = useUsersStore((s) => s.users);

  /**
   * Cross-reference: clients who appear in BOTH "no workout" AND
   * "no diet" lists → they're new and need full programme setup.
   *
   * Per Avihu's directive: surface ONLY those whose status is
   * "active" AND whose dateFinished is still in the future (their
   * coaching contract hasn't ended). Past-dateFinished users —
   * even if technically lacking plans — aren't actionable: the
   * trainer isn't coaching them anymore.
   *
   * We build a Set of eligible userIds from the users store; if the
   * store hasn't loaded yet, we render nothing rather than flash
   * the unfiltered list.
   */
  // STRICT allow-list: only surface users we can confirm are
  // `deriveAccountStatus === "active"` AND whose contract hasn't
  // ended. Per Avihu: anyone who can't be confirmed active is
  // hidden — "if in doubt, hide it". IDs are normalised to strings
  // to handle Mongo ObjectId vs string mismatches.
  const eligibleIds = useMemo(() => {
    const s = new Set<string>();
    for (const u of allUsers ?? []) {
      if (!u._id) continue;
      if (deriveAccountStatus(u) !== "active") continue;
      if (hasContractEnded(u)) continue;
      s.add(String(u._id));
    }
    return s;
  }, [allUsers]);

  const newClients = useMemo(() => {
    if (!noWorkout?.data || !noDiet?.data) return [];
    const noDietIds = new Set(noDiet.data.map((u: any) => String(u._id)));
    return noWorkout.data.filter(
      (u: any) => noDietIds.has(String(u._id)) && eligibleIds.has(String(u._id))
    );
  }, [noWorkout?.data, noDiet?.data, eligibleIds]);

  return (
    <section
      dir="rtl"
      className="flex h-full max-h-[75vh] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
    >
      {/* Header — neutral, brand-aligned */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60">
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
          <span className="inline-flex h-7 min-w-[2rem] items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 text-xs font-bold text-blue-700 dark:text-blue-300">
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
              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 px-3 py-3 transition-all hover:border-blue-300 hover:bg-blue-50/40 dark:hover:border-blue-700 dark:hover:bg-blue-950/20 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full brand-gradient text-xs font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                {getInitials(user.firstName, user.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {userFullName(user)}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    <FaDumbbell size={8} />
                    ללא אימון
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    <FaAppleWhole size={8} />
                    ללא תזונה
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default NewClientsCard;
