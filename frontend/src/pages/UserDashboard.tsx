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
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import useUpdateUser from "@/hooks/mutations/User/useUpdateUser";
import type { AccountStatus, IUser } from "@/interfaces/IUser";
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

// Derive the 3-state status from user data
const deriveStatus = (user: IUser | undefined): AccountStatus => {
  if (!user) return "active";
  if (user.accountStatus) return user.accountStatus;
  return user.hasAccess === false ? "disabled" : "active";
};

const STATUS_LABEL: Record<AccountStatus, string> = {
  active: "פעיל",
  user: "משתמש",
  disabled: "כבוי",
};

const STATUS_DESCRIPTION: Record<AccountStatus, string> = {
  active: "מתאמן פעיל — יש גישה מלאה לאפליקציה",
  user: "משתמש רשום — יש גישה לאפליקציה",
  disabled: "חסום — לא יוכל להתחבר לאפליקציה",
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

  useEffect(() => {
    setStatus(deriveStatus(data));
    setPlanType(data?.planType || "");
  }, [data]);

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
    const updated: IUser = {
      ...currentUser,
      accountStatus: pendingStatus,
      hasAccess: pendingStatus !== "disabled",
    };
    try {
      await updateUser.mutateAsync({ id: currentUser._id!, user: updated });
      setStatus(pendingStatus);
    } catch (e: any) {
      // Visible diagnostic so we know exactly what went wrong on the API call
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

  const statusColors: Record<AccountStatus, { border: string; bg: string; text: string; dot: string }> = {
    active: { border: "border-emerald-200 dark:border-emerald-900/60", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
    user: { border: "border-blue-200 dark:border-blue-900/60", bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
    disabled: { border: "border-red-200 dark:border-red-900/60", bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
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
                <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">לקוח</p>
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
          <FaUser size={14} className={mainTab === "profile" ? "text-white" : "text-slate-500 dark:text-slate-400"} />
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
                <span className={active ? "text-white" : "text-slate-500 dark:text-slate-400"}>{t.icon}</span>
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
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <CreateWorkoutPlanWrapper embedded>
            <WorkoutPlans />
          </CreateWorkoutPlanWrapper>
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
  onConfirm,
  onCancel,
}: {
  fromStatus: AccountStatus;
  toStatus: AccountStatus;
  userName: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isDangerous = toStatus === "disabled";
  const isActivation = fromStatus === "disabled" && toStatus !== "disabled";

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl"
      >
        <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-slate-100">
          {isDangerous ? "⚠️ אישור חסימת מתאמן" : isActivation ? "✅ הפעלת מתאמן" : "שינוי סטטוס"}
        </h3>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          אתה עומד לשנות את הסטטוס של <span className="font-bold text-slate-900 dark:text-slate-100">{userName}</span>{" "}
          מ-
          <span className="font-bold">"{STATUS_LABEL[fromStatus]}"</span> ל-
          <span className="font-bold">"{STATUS_LABEL[toStatus]}"</span>
        </p>

        <div
          className={`mb-4 rounded-xl border p-3 text-sm ${
            isDangerous
              ? "border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300"
              : "border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-800"
          }`}
        >
          <p className="font-semibold">{STATUS_DESCRIPTION[toStatus]}</p>
          {isDangerous && (
            <p className="mt-1 text-xs">
              💡 המתאמן יראה הודעת "ההרשאה פגה" בפתיחה הבאה של האפליקציה.
            </p>
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
