/**
 * UserDashboard — דף פרופיל מתאמן (עיצוב חדש)
 *
 * המסך מציג את כל המידע על מתאמן בודד עם 5 טאבים:
 *   1. פרופיל מתאמן — פרטים אישיים
 *   2. התקדמות — משקל / היקפים / כוח / תמונות (סאב-טאבים)
 *   3. תוכנית אימונים — לקישור לדף הקיים
 *   4. תפריט תזונה — לקישור לדף הקיים
 *   5. שאלונים — תשובות לטפסים
 *
 * חיבור: useUserQuery (קיים) → GET /users/one
 */
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import useUpdateUser from "@/hooks/mutations/User/useUpdateUser";
import type { AccountStatus, IUser, IStatusHistoryEntry } from "@/interfaces/IUser";
import { useUsersStore } from "@/store/userStore";
import {
  FaUser,
  FaArrowTrendUp,
  FaDumbbell,
  FaAppleWhole,
  FaClipboardList,
  FaCalendarDays,
  FaCalendarCheck,
  FaChevronDown,
  FaArrowRight,
  FaPenToSquare,
} from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa6";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";
import useUserQuery from "@/hooks/queries/user/useUserQuery";
import DateUtils from "@/lib/dateUtils";
import { WeightProgression } from "@/components/UserDashboard/WeightProgression/WeightProgression";
import { WorkoutProgression } from "@/components/UserDashboard/WorkoutProgression/WorkoutProgression";
import MeasurementsProgression from "@/components/UserDashboard/MeasurementProgression/MeasurementsProgression";
import UserFormResponses from "@/components/UserDashboard/FormResponses/UserFormResponses";
import { WeightProgressionPhotos } from "@/components/UserDashboard/WeightProgression/WeightProgressionPhotos";
import CreateWorkoutPlanWrapper from "@/components/Wrappers/CreateWorkoutPlanWrapper";
import WorkoutPlanHistorySection from "@/components/UserDashboard/WorkoutPlanHistory/WorkoutPlanHistorySection";
import SwapTemporaryPlanModal from "@/components/UserDashboard/WorkoutPlanHistory/SwapTemporaryPlanModal";
import { FaArrowsRotate } from "react-icons/fa6";
import WorkoutPlans from "@/components/workout plan/WorkoutPlans";
import DietPlanWrapper from "@/components/DietPlan/DietPlanWrapper";
import { ViewDietPlanPage } from "@/pages/ViewDietPlanPage";
import { tryGuardedNav } from "@/hooks/useNavigationBlocker";

// Keep these exports — other components depend on them
export const weightTab = "מעקב שקילה";
export const workoutTab = "מעקב אימון";
export const measurementTab = "מעקב היקפים";
export const formsTab = "שאלונים";

type MainTab = "profile" | "progress" | "workout" | "diet" | "forms";
type ProgressSubTab = "weight" | "measurements" | "strength" | "photos";

const mainTabs: { id: MainTab; label: string; icon: JSX.Element }[] = [
  { id: "progress", label: "התקדמות", icon: <FaArrowTrendUp size={14} /> },
  { id: "workout", label: "תוכנית אימונים", icon: <FaDumbbell size={14} /> },
  { id: "diet", label: "תפריט תזונה", icon: <FaAppleWhole size={14} /> },
  { id: "forms", label: "שאלונים", icon: <FaClipboardList size={14} /> },
];

const progressSubTabs: { id: ProgressSubTab; label: string }[] = [
  { id: "weight", label: "משקל" },
  { id: "strength", label: "כוח" },
  { id: "photos", label: "תמונות" },
  { id: "measurements", label: "היקפים" },
];

const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName?.[0] || "";
  const l = lastName?.[0] || "";
  return (f + l).toUpperCase() || "?";
};

// Shared deriver — also applies the auto-downgrade rule for users
// whose dateFinished has passed (active → user). See lib/userStatus.
import { deriveAccountStatus, hasContractEnded } from "@/lib/userStatus";
const deriveStatus = deriveAccountStatus;

const STATUS_LABEL: Record<AccountStatus, string> = {
  active: "פעיל",
  user: "משתמש",
  disabled: "כבוי",
  frozen: "הקפאה",
};

const STATUS_DESCRIPTION: Record<AccountStatus, string> = {
  active: "מתאמן פעיל — יש גישה מלאה לאפליקציה",
  user: "משתמש רשום — יש גישה לאפליקציה",
  disabled: "חסום — לא יוכל להתחבר לאפליקציה",
  frozen: "הקפאה זמנית — שומר על גישה לאפליקציה, מוסתר מרשימות מעקב",
};

export const UserDashboard = () => {
  const stateUser = useLocation().state;
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading, isError, error } = useUserQuery(id || "oneUser", !stateUser);
  const updateUser = useUpdateUser(id || "");

  /**
   * Tab state is mirrored to URL search params (`?tab=` / `?sub=`) so that:
   *   1. Refreshing the page keeps the active tab.
   *   2. Navigating away (e.g. to a form-response page) and clicking the
   *      browser/page "back" button returns to the exact same tab, not
   *      the default "progress" tab.
   * We use `replace` on tab changes so we don't pollute browser history.
   */
  const [searchParams, setSearchParams] = useSearchParams();

  const isMainTab = (v: string | null): v is MainTab =>
    v === "profile" || v === "progress" || v === "workout" || v === "diet" || v === "forms";
  const isProgressSub = (v: string | null): v is ProgressSubTab =>
    v === "weight" || v === "measurements" || v === "strength" || v === "photos";

  const [mainTab, setMainTabState] = useState<MainTab>(() => {
    const v = searchParams.get("tab");
    return isMainTab(v) ? v : "progress";
  });
  const [progressSub, setProgressSubState] = useState<ProgressSubTab>(() => {
    const v = searchParams.get("sub");
    return isProgressSub(v) ? v : "weight";
  });

  // Re-sync state from URL whenever the URL changes (back/forward navigation).
  useEffect(() => {
    const t = searchParams.get("tab");
    if (isMainTab(t) && t !== mainTab) setMainTabState(t);
    const s = searchParams.get("sub");
    if (isProgressSub(s) && s !== progressSub) setProgressSubState(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setMainTab = (next: MainTab) => {
    // Route through the unsaved-changes guard: if an editor (workout
    // plan, diet plan) has dirty state, this opens its confirmation
    // dialog instead of changing the tab.
    tryGuardedNav(() => {
      setMainTabState(next);
      const params = new URLSearchParams(searchParams);
      params.set("tab", next);
      setSearchParams(params, { replace: true });
    });
  };
  const setProgressSub = (next: ProgressSubTab) => {
    setProgressSubState(next);
    const params = new URLSearchParams(searchParams);
    params.set("sub", next);
    setSearchParams(params, { replace: true });
  };

  // Status state — derived from user, with pending change for confirmation popup
  const [status, setStatus] = useState<AccountStatus>("active");
  const [pendingStatus, setPendingStatus] = useState<AccountStatus | null>(null);

  // Plan type state
  const [planType, setPlanType] = useState<string>("");
  const [pendingPlanType, setPendingPlanType] = useState<string | null>(null);

  // Swap-temporary-plan modal (workout tab). Lives at this level so
  // the action bar above the editor can open it and the modal sits
  // outside the editor's form context.
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  // The currently-logged-in trainer (whoever is using the app right
  // now) — captured into status-history entries so the trainer
  // later sees "who changed this trainee's status, when".
  const currentUserAuth = useUsersStore((s) => s.currentUser);

  // Seed local state from either the fetched `data` OR the navigation
  // `state` payload — when the trainer clicks into a user from the
  // list, `useUserQuery` is disabled (the row already has the user
  // object) so `data` is undefined and the header dropdowns would
  // render "בחר סוג" / default-active even when the user's saved
  // planType + accountStatus differ. Reading from the merged source
  // keeps the dropdowns in sync with what the profile card shows.
  useEffect(() => {
    const src = (data || stateUser) as IUser | undefined;
    setStatus(deriveStatus(src));
    setPlanType(src?.planType || "");
  }, [data, stateUser]);

  // Auto-downgrade persistence: if the trainer opens a profile whose
  // contract has ended (dateFinished < today) but the stored status
  // is still "active", quietly persist the downgrade to "user" so the
  // server and every other view (lists, filters) stay in sync. Fires
  // once per profile open. We guard on `id` to avoid re-firing on the
  // optimistic update echo, and skip if there's already a pending
  // status change (the trainer is mid-edit).
  const autoDowngradeFiredRef = useRef<string | null>(null);
  useEffect(() => {
    const src = (data || stateUser) as IUser | undefined;
    if (!src?._id) return;
    if (autoDowngradeFiredRef.current === src._id) return;
    const storedBase: AccountStatus = src.accountStatus
      ? src.accountStatus
      : src.hasAccess === false
        ? "disabled"
        : "active";
    if (storedBase !== "active") return;
    if (!hasContractEnded(src)) return;
    if (pendingStatus) return;
    autoDowngradeFiredRef.current = src._id;
    updateUser.mutate({
      id: src._id,
      user: {
        ...src,
        accountStatus: "user",
        hasAccess: true, // "user" still has app access — only "disabled" blocks it
      } as IUser,
    });
  }, [data, stateUser, pendingStatus, updateUser]);

  if (isLoading) return <Loader size="large" />;
  if (isError && !data) return <ErrorPage message={error.message} />;

  const currentUser = data || stateUser;
  const initials = getInitials(currentUser?.firstName, currentUser?.lastName);

  const handleStatusChange = (newStatus: AccountStatus) => {
    if (newStatus === status) return;
    setPendingStatus(newStatus);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus || !currentUser) return;

    const fromStatus = status;
    const toStatus = pendingStatus;
    const now = new Date();

    // Build the payload. Freeze captures a snapshot of how many
    // days were left until dateFinished at the moment of pause,
    // so the trainer can later honour that remaining time even if
    // the calendar moves on while the trainee is paused.
    const updated: IUser = {
      ...currentUser,
      accountStatus: toStatus,
      // Frozen users keep app access — only "disabled" blocks it.
      hasAccess: toStatus !== "disabled",
    };

    // Audit-log entry for this status change. Populated below with
    // freeze-specific extras when applicable.
    const historyEntry: IStatusHistoryEntry = {
      at: now,
      fromStatus,
      toStatus,
      changedBy: ((currentUserAuth as { _id?: string } | null)?._id) || undefined,
    };

    if (toStatus === "frozen") {
      // ENTERING freeze — snapshot the days remaining.
      const finished = currentUser?.dateFinished
        ? new Date(currentUser.dateFinished).getTime()
        : null;
      const daysRemaining =
        finished !== null && !Number.isNaN(finished)
          ? Math.max(0, Math.ceil((finished - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;
      updated.frozenAt = now;
      updated.frozenDaysRemaining = daysRemaining;
      historyEntry.frozenDaysRemaining = daysRemaining;
    } else if (fromStatus === "frozen") {
      // LEAVING freeze — restore the days that were preserved. We
      // extend dateFinished by frozenDaysRemaining so the trainee
      // gets back exactly the coaching time they paused with.
      const savedDays = currentUser.frozenDaysRemaining || 0;
      if (savedDays > 0) {
        const base = currentUser.dateFinished
          ? new Date(currentUser.dateFinished).getTime()
          : now.getTime();
        const newFinished = new Date(base + savedDays * 24 * 60 * 60 * 1000);
        updated.dateFinished = newFinished;
        historyEntry.daysAdded = savedDays;
      }
      // Clear the snapshot now that it's been honoured.
      updated.frozenAt = undefined;
      updated.frozenDaysRemaining = undefined;
    }

    // Append to the status history log. Keep history immutable —
    // we only push new entries, never edit old ones.
    updated.statusHistory = [...(currentUser.statusHistory || []), historyEntry];

    try {
      await updateUser.mutateAsync({ id: currentUser._id!, user: updated });
      setStatus(toStatus);
    } catch (e: any) {
      console.error("Status update failed:", {
        status: e?.status || e?.response?.status,
        message: e?.message || e?.data?.message,
        body: e?.data,
      });
    } finally {
      setPendingStatus(null);
    }
  };

  const cancelStatusChange = () => setPendingStatus(null);

  const handlePlanTypeChange = (newPlanType: string) => {
    if (newPlanType === planType) return;
    setPendingPlanType(newPlanType);
  };

  const confirmPlanTypeChange = async () => {
    if (!pendingPlanType || !currentUser) return;
    const updated: IUser = {
      ...currentUser,
      planType: pendingPlanType,
    };
    try {
      await updateUser.mutateAsync({ id: currentUser._id!, user: updated });
      setPlanType(pendingPlanType);
    } catch (e) {
      console.error(e);
    } finally {
      setPendingPlanType(null);
    }
  };

  const cancelPlanTypeChange = () => setPendingPlanType(null);

  const statusColors: Record<
    AccountStatus,
    { border: string; bg: string; text: string; dot: string }
  > = {
    active: {
      border: "border-emerald-200 dark:border-emerald-900/60",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-300",
      dot: "bg-emerald-500",
    },
    user: {
      border: "border-blue-200 dark:border-blue-900/60",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-300",
      dot: "bg-blue-500",
    },
    disabled: {
      border: "border-red-200 dark:border-red-900/60",
      bg: "bg-red-50 dark:bg-red-950/40",
      text: "text-red-700 dark:text-red-300",
      dot: "bg-red-500",
    },
    frozen: {
      border: "border-cyan-200 dark:border-cyan-900/60",
      bg: "bg-cyan-50 dark:bg-cyan-950/40",
      text: "text-cyan-700 dark:text-cyan-300",
      dot: "bg-cyan-500",
    },
  };
  const sc = statusColors[status];

  return (
    <div
      data-testid="user-dashboard"
      dir="rtl"
      className="flex flex-col gap-5"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate("/users")}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600"
      >
        <FaArrowRight size={11} />
        <span>חזרה לרשימת המתאמנים</span>
      </button>

      {/* Profile header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="absolute inset-y-0 right-0 w-1.5 bg-blue-400" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-400 text-2xl font-bold text-white ring-4 ring-white">
              {initials}
            </div>
            <div className="flex flex-col gap-1">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  לקוח
                </p>
                <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-slate-100">
                  {currentUser?.firstName} {currentUser?.lastName}
                </h2>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <FaCalendarDays size={12} className="text-blue-500" />
                  <span className="font-semibold">תחילת ליווי:</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {currentUser?.dateJoined
                      ? DateUtils.formatDate(currentUser.dateJoined, "DD/MM/YYYY")
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <FaCalendarCheck size={12} className="text-indigo-500" />
                  <span className="font-semibold">סיום ליווי:</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {currentUser?.dateFinished
                      ? DateUtils.formatDate(currentUser.dateFinished, "DD/MM/YYYY")
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser?.phone && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  צור קשר
                </label>
                <a
                  href={`https://wa.me/${(currentUser.phone || "")
                    .replace(/\D/g, "")
                    .replace(/^0/, "972")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`שלח הודעה ב-WhatsApp ל-${currentUser.firstName ?? "מתאמן"}`}
                  title="פתח שיחת WhatsApp"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <FaWhatsapp size={16} className="text-emerald-600 dark:text-emerald-300" />
                  WhatsApp
                </a>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                סוג תוכנית
              </label>
              <div className="relative">
                <select
                  value={planType}
                  onChange={(e) => handlePlanTypeChange(e.target.value)}
                  disabled={updateUser.isPending}
                  className="cursor-pointer appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pe-9 ps-4 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="" disabled>
                    בחר סוג
                  </option>
                  <option value="חיטוב">חיטוב</option>
                  <option value="מסה">מסה</option>
                </select>
                <FaChevronDown
                  size={10}
                  className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                סטטוס
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as AccountStatus)}
                  disabled={updateUser.isPending}
                  className={`cursor-pointer appearance-none rounded-xl border py-2 pe-9 ps-9 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 ${sc.border} ${sc.bg} ${sc.text}`}
                >
                  <option value="active">פעיל</option>
                  <option value="user">משתמש</option>
                  <option value="frozen">הקפאה</option>
                  <option value="disabled">כבוי</option>
                </select>
                <span
                  className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full shadow-sm ${sc.dot}`}
                />
                <FaChevronDown
                  size={10}
                  className={`pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 ${sc.text}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main tab bar */}
      <div className="flex flex-wrap items-center justify-start gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-5 py-3 shadow-sm">
        <button
          onClick={() => setMainTab("profile")}
          className={`inline-flex items-center gap-2 rounded-xl border-l border-slate-200 dark:border-slate-800 px-4 py-2 pl-5 text-sm font-semibold transition-all ${
            mainTab === "profile"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-700 dark:text-slate-200 hover:bg-slate-100"
          }`}
        >
          <FaUser
            size={14}
            className={mainTab === "profile" ? "text-white" : "text-slate-500 dark:text-slate-400"}
          />
          <span>פרופיל מתאמן</span>
        </button>
        <div className="flex items-center gap-1">
          {mainTabs.map((t) => {
            const active = mainTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setMainTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                <span>{t.label}</span>
                <span className={active ? "text-white" : "text-slate-500 dark:text-slate-400"}>
                  {t.icon}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {mainTab === "profile" && (
        <div className="w-full max-w-3xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaUser size={16} className="text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">פרטי משתמש</h2>
            </div>
            <button
              onClick={() => navigate(`/users/edit/${currentUser?._id}`)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <FaPenToSquare size={11} />
              <span>עריכה</span>
            </button>
          </div>
          {/* Status badge — mirrors the header status dropdown so the
              trainer sees the trainee's account state without scrolling
              up. Single source of truth: the `status` state, which is
              derived from `data.accountStatus` (or hasAccess fallback)
              and updated optimistically by the dropdown change handler. */}
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 px-4 py-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              סטטוס במערכת:
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                status === "active"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : status === "user"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : status === "frozen"
                      ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  status === "active"
                    ? "bg-emerald-500"
                    : status === "user"
                      ? "bg-blue-500"
                      : status === "frozen"
                        ? "bg-cyan-500"
                        : "bg-rose-500"
                }`}
              />
              {STATUS_LABEL[status]}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {STATUS_DESCRIPTION[status]}
            </span>
            {/* Freeze snapshot — surfaces the captured days remaining
                so the trainer always sees what was preserved when
                they paused this trainee. Shown only when relevant. */}
            {status === "frozen" && typeof currentUser?.frozenDaysRemaining === "number" && (
              <span className="ms-auto inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 dark:border-cyan-900/40 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-cyan-700 dark:text-cyan-300">
                ❄️ נשארו {currentUser.frozenDaysRemaining} ימי ליווי בעת ההקפאה
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ProfileField label="שם פרטי" value={currentUser?.firstName} />
            <ProfileField label="שם משפחה" value={currentUser?.lastName} />
            <ProfileField label="טלפון" value={currentUser?.phone} dir="ltr" />
            <ProfileField label="אימייל" value={currentUser?.email} dir="ltr" />
            <ProfileField label="סוג תוכנית" value={currentUser?.planType} />
            <ProfileField
              label="תאריך תחילת הליווי"
              value={
                currentUser?.dateJoined
                  ? DateUtils.formatDate(currentUser.dateJoined, "DD/MM/YYYY")
                  : "—"
              }
            />
            <ProfileField
              label="תאריך סיום הליווי"
              value={
                currentUser?.dateFinished
                  ? DateUtils.formatDate(currentUser.dateFinished, "DD/MM/YYYY")
                  : "—"
              }
            />
          </div>
          {currentUser?.dietaryType && currentUser.dietaryType.length > 0 && (
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
              <ProfileField label="הגבלות תזונה" value={currentUser.dietaryType.join(", ")} />
            </div>
          )}
        </div>
      )}

      {/* Freeze documentation — shown only when the trainee is
          currently frozen. Displays months+days remaining (calculated
          from frozenDaysRemaining) so the trainer can plan around it. */}
      {mainTab === "profile" && status === "frozen" && currentUser && (
        <FreezeDocumentationCard user={currentUser} />
      )}

      {/* Status history — full audit log of every status change.
          Newest first. Always shown on the profile tab (even when
          empty) so the trainer knows where to look. */}
      {mainTab === "profile" && currentUser && (
        <StatusHistoryCard history={currentUser.statusHistory} />
      )}

      {mainTab === "progress" && (
        <div className="flex flex-col gap-4">
          {/* Sub-tabs */}
          <div className="flex w-fit items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
            {progressSubTabs.map((s) => (
              <button
                key={s.id}
                onClick={() => setProgressSub(s.id)}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
                  progressSub === s.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
            {progressSub === "weight" && <WeightProgression />}
            {progressSub === "measurements" && <MeasurementsProgression />}
            {progressSub === "strength" && <WorkoutProgression />}
            {progressSub === "photos" && <WeightProgressionPhotos />}
          </div>
        </div>
      )}

      {mainTab === "workout" && (
        <div className="flex flex-col gap-4">
          {/* Workout-plan editor with a thin, quiet action row above it.
              Per council: the loud blue banner was builder pride, not
              user value. Swap is a verb → small header button. History
              is a record → renders below the editor, only when it has
              content (WorkoutPlanHistorySection hides itself when
              empty). */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setSwapModalOpen(true)}
              title="להחליף את התוכנית הפעילה לתקופה מוגבלת. התוכנית הקודמת תישמר בהיסטוריה ותהיה ניתנת לשחזור."
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100/60 dark:border-blue-900/40 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow"
            >
              <FaArrowsRotate size={11} />
              <span>החלפה זמנית</span>
            </button>
          </div>

          {/* Existing workout-plan editor */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <CreateWorkoutPlanWrapper embedded>
              <WorkoutPlans />
            </CreateWorkoutPlanWrapper>
          </div>

          {/* Plan history — below the editor, hidden when empty (see
              hideWhenEmpty prop). Reference material lives out of the
              primary task path. */}
          {currentUser?._id && (
            <WorkoutPlanHistorySection
              userId={currentUser._id}
              activePlan={undefined /* TODO: feed active plan once available in this scope */}
              hideWhenEmpty
            />
          )}

          {/* Swap modal */}
          {currentUser?._id && swapModalOpen && (
            <SwapTemporaryPlanModal
              open={swapModalOpen}
              onClose={() => setSwapModalOpen(false)}
              userId={currentUser._id}
              currentPlanId={undefined /* TODO: pass current plan _id when accessible here */}
            />
          )}
        </div>
      )}

      {mainTab === "diet" && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <DietPlanWrapper>
            <ViewDietPlanPage embedded />
          </DietPlanWrapper>
        </div>
      )}

      {mainTab === "forms" && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <UserFormResponses />
        </div>
      )}

      {/* Status change confirmation popup */}
      {pendingStatus && (
        <StatusConfirmationModal
          fromStatus={status}
          toStatus={pendingStatus}
          userName={`${currentUser?.firstName} ${currentUser?.lastName}`}
          isPending={updateUser.isPending}
          // Days remaining from now until dateFinished — only relevant
          // when freezing. The modal displays it prominently so the
          // trainer can see what's being captured.
          daysRemaining={
            currentUser?.dateFinished
              ? Math.max(
                  0,
                  Math.ceil(
                    (new Date(currentUser.dateFinished).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                )
              : null
          }
          onConfirm={confirmStatusChange}
          onCancel={cancelStatusChange}
        />
      )}

      {/* Plan type change confirmation popup */}
      {pendingPlanType && (
        <PlanTypeConfirmationModal
          fromPlanType={planType}
          toPlanType={pendingPlanType}
          userName={`${currentUser?.firstName} ${currentUser?.lastName}`}
          isPending={updateUser.isPending}
          onConfirm={confirmPlanTypeChange}
          onCancel={cancelPlanTypeChange}
        />
      )}
    </div>
  );
};

function PlanTypeConfirmationModal({
  fromPlanType,
  toPlanType,
  userName,
  isPending,
  onConfirm,
  onCancel,
}: {
  fromPlanType: string;
  toPlanType: string;
  userName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={() => !isPending && onCancel()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl"
      >
        <div className="mb-2 flex items-center gap-2 text-blue-600">
          <FaDumbbell size={18} />
          <h3 className="text-lg font-bold">שינוי סוג תוכנית</h3>
        </div>

        <p className="mb-3 text-sm text-slate-700 dark:text-slate-200">
          אתה עומד לשנות את סוג התוכנית של{" "}
          <span className="font-bold text-slate-900 dark:text-slate-100">{userName}</span> מ-
          <span className="font-bold">"{fromPlanType || "—"}"</span> ל-
          <span className="font-bold">"{toPlanType}"</span>
        </p>

        <div className="mb-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 p-3 text-sm text-blue-900">
          <p className="font-semibold">📱 מה זה משנה באפליקציית המתאמן:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
            <li>
              המאמרים שהמתאמן רואה — יוצגו מאמרים השייכים ל-{toPlanType} בלבד (+ מאמרים כלליים)
            </li>
            <li>פרופיל המתאמן באפליקציה יציג את סוג התוכנית החדש</li>
            <li>תוכנית האימון/תפריט הקיימים לא משתנים — תצטרך לעדכן אותם בנפרד</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            ביטול
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "שומר..." : "אישור השינוי"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusConfirmationModal({
  fromStatus,
  toStatus,
  userName,
  isPending,
  daysRemaining,
  onConfirm,
  onCancel,
}: {
  fromStatus: AccountStatus;
  toStatus: AccountStatus;
  userName: string;
  isPending: boolean;
  daysRemaining: number | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isDangerous = toStatus === "disabled";
  const isActivation = fromStatus === "disabled" && toStatus !== "disabled";
  const isFreeze = toStatus === "frozen";

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      // Backdrop click cancels — but ONLY when the mutation isn't in
      // flight. Otherwise an accidental click outside while saving
      // would orphan the request and leave the UI inconsistent.
      onClick={() => !isPending && onCancel()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl"
      >
        <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-slate-100">
          {isDangerous
            ? "⚠️ אישור חסימת מתאמן"
            : isActivation
              ? "✅ הפעלת מתאמן"
              : isFreeze
                ? "❄️ אישור הקפאת מתאמן"
                : "שינוי סטטוס"}
        </h3>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          אתה עומד לשנות את הסטטוס של{" "}
          <span className="font-bold text-slate-900 dark:text-slate-100">{userName}</span> מ-
          <span className="font-bold">"{STATUS_LABEL[fromStatus]}"</span> ל-
          <span className="font-bold">"{STATUS_LABEL[toStatus]}"</span>
        </p>

        <div
          className={`mb-4 rounded-xl border p-3 text-sm ${
            isDangerous
              ? "border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300"
              : isFreeze
                ? "border-cyan-200 dark:border-cyan-900/60 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300"
                : "border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-800"
          }`}
        >
          <p className="font-semibold">{STATUS_DESCRIPTION[toStatus]}</p>
          {isDangerous && (
            <p className="mt-1 text-xs">
              💡 המתאמן יראה הודעת "ההרשאה פגה" בפתיחה הבאה של האפליקציה.
            </p>
          )}
          {/* Freeze-specific block: show days remaining + a clear
              note that this will be saved in the profile so the
              trainer can honour it when unfreezing later. */}
          {isFreeze && (
            <div className="mt-3 rounded-lg bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-900/40 p-3">
              <p className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300 mb-1">
                💎 ימי ליווי שנותרו במועד ההקפאה
              </p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {daysRemaining !== null ? daysRemaining : "—"}
                <span className="ms-1 text-sm font-bold text-slate-500">ימים</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                המספר יישמר בפרופיל של המתאמן כדי שתוכל לכבד אותו בעת שחרור מהקפאה.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            ביטול
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 ${
              isDangerous ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPending ? "שומר..." : "אישור"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   FreezeDocumentationCard — surfaces the freeze snapshot in a clean
   card on the profile tab. Shows months+days breakdown so the
   trainer can immediately see how much coaching time was preserved.
=================================================================== */
function FreezeDocumentationCard({ user }: { user: IUser }) {
  const totalDays = user.frozenDaysRemaining ?? 0;
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;
  const frozenAt = user.frozenAt
    ? DateUtils.formatDate(new Date(user.frozenAt), "DD/MM/YYYY")
    : null;

  return (
    <section
      dir="rtl"
      className="rounded-2xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50/40 dark:bg-cyan-950/20 p-5 shadow-sm"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
          ❄️
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            תיעוד הקפאה
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            המתאמן הוקפא ב-{frozenAt || "—"} · הזמן שנשמר יוחזר לתום הליווי
            כשתחזיר אותו לפעיל
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <FreezeStat
          label="חודשים שנותרו"
          value={months}
          suffix={months === 1 ? "חודש" : "חודשים"}
        />
        <FreezeStat
          label="ימים שנותרו"
          value={days}
          suffix={days === 1 ? "יום" : "ימים"}
        />
        <FreezeStat
          label="סה״כ ימי ליווי"
          value={totalDays}
          suffix={totalDays === 1 ? "יום" : "ימים"}
        />
      </div>
    </section>
  );
}

function FreezeStat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div className="rounded-xl border border-cyan-200/60 dark:border-cyan-900/30 bg-white dark:bg-slate-900 p-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-cyan-700 dark:text-cyan-300">
        {value}
      </p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400">{suffix}</p>
    </div>
  );
}

/* ===================================================================
   StatusHistoryCard — append-only audit log of every status change.
   Shows newest first; each row records who/when/from/to + any
   freeze-specific metadata (days preserved, days restored).
=================================================================== */
function StatusHistoryCard({ history }: { history?: IStatusHistoryEntry[] }) {
  const sorted = [...(history || [])].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  return (
    <section
      dir="rtl"
      className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-sm">
          🕒
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            היסטוריית סטטוסים
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            כל שינוי סטטוס שנעשה למתאמן — מי, מתי, ומה נשמר
          </p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 py-8 text-center">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            אין עדיין שינויי סטטוס
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            כל פעולת סטטוס שתעשה תופיע כאן
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((entry, idx) => (
            <li
              key={idx}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 px-4 py-2.5"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatusPill status={entry.fromStatus} />
                <span className="text-slate-400">→</span>
                <StatusPill status={entry.toStatus} />
                {entry.frozenDaysRemaining !== undefined && (
                  <span className="rounded-md bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:text-cyan-300">
                    ❄️ נשמרו {entry.frozenDaysRemaining} ימים
                  </span>
                )}
                {entry.daysAdded !== undefined && entry.daysAdded > 0 && (
                  <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    + {entry.daysAdded} ימים נוספו לתום ליווי
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {DateUtils.formatDate(new Date(entry.at), "DD/MM/YYYY")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusPill({ status }: { status: AccountStatus }) {
  const styles =
    status === "active"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
      : status === "user"
        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
        : status === "frozen"
          ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300"
          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${styles}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function ProfileField({
  label,
  value,
  dir = "rtl",
}: {
  label: string;
  value?: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div
        dir={dir}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100"
      >
        {value || "—"}
      </div>
    </div>
  );
}
