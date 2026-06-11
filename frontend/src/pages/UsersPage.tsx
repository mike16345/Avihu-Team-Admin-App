/**
 * UsersPage — רשימת מתאמנים (עיצוב חדש)
 *
 * חיבור לנתונים אמיתיים:
 *   - useUsersQuery — שולף את כל המתאמנים מהשרת (GET /users)
 *   - useDeleteUser — מחיקת מתאמן (DELETE /users/one)
 *
 * שינוי עיקרי: טבלה → כרטיסים. כל שאר הפונקציונליות זהה.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { FaPlus, FaMagnifyingGlass } from "react-icons/fa6";
import { weightTab } from "@/pages/UserDashboard";
import { IUser } from "@/interfaces/IUser";
import useUsersQuery from "@/hooks/queries/user/useUsersQuery";
import DateUtils from "@/lib/dateUtils";
import { deriveAccountStatus } from "@/lib/userStatus";
import ErrorPage from "@/pages/ErrorPage";
import Loader from "@/components/ui/Loader";

const MINIMUM_WARNING_DAYS = 3;

type StatusFilter = "הכל" | "פעיל" | "משתמשים" | "הקפאה" | "מסתיים בקרוב" | "ללא תאריך סיום";

export const UsersPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useUsersQuery();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("הכל");

  const sortedUsers = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const aHasDate = !!a.dateFinished;
      const bHasDate = !!b.dateFinished;
      if (aHasDate && !bHasDate) return -1;
      if (!aHasDate && bHasDate) return 1;
      if (aHasDate && bHasDate) {
        return new Date(b.dateFinished!).getTime() - new Date(a.dateFinished!).getTime();
      }
      return 0;
    });
  }, [data]);

  const filtered = useMemo(() => {
    return sortedUsers.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const matchSearch =
        fullName.includes(search.toLowerCase()) ||
        u.planType?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search);

      if (!matchSearch) return false;

      if (statusFilter === "הכל") return true;
      const daysLeft = u.dateFinished
        ? DateUtils.getDaysDifference(new Date(), u.dateFinished)
        : null;

      if (statusFilter === "מסתיים בקרוב")
        return daysLeft !== null && daysLeft <= MINIMUM_WARNING_DAYS && daysLeft >= 0;
      // "פעיל" / "משתמשים" filters use the *derived* status
      // (lib/userStatus). Users whose dateFinished has passed
      // auto-fall from "active" → "user", so the same trainee
      // appears in only one bucket at a time.
      if (statusFilter === "פעיל") return deriveAccountStatus(u) === "active";
      if (statusFilter === "משתמשים") return deriveAccountStatus(u) === "user";
      if (statusFilter === "הקפאה") return deriveAccountStatus(u) === "frozen";
      if (statusFilter === "ללא תאריך סיום") return !u.dateFinished;

      return true;
    });
  }, [sortedUsers, search, statusFilter]);

  const stats = useMemo(() => {
    const total = sortedUsers.length;
    // Counts go through the *derived* status (lib/userStatus). This is
    // the single source of truth the home dashboard and the trainee
    // profile also use, so the four pills here can't drift from those
    // views. Notably: users whose dateFinished has passed auto-drop
    // from "פעילים" and land in "משתמשים" — exactly the rule Avihu
    // set for the dashboard attention lists.
    const active = sortedUsers.filter((u) => deriveAccountStatus(u) === "active").length;
    const asUser = sortedUsers.filter((u) => deriveAccountStatus(u) === "user").length;
    const frozen = sortedUsers.filter((u) => deriveAccountStatus(u) === "frozen").length;

    const endingSoon = sortedUsers.filter((u) => {
      if (!u.dateFinished) return false;
      const d = DateUtils.getDaysDifference(new Date(), u.dateFinished);

      return d <= 7 && d >= 0;
    }).length;

    return { total, active, inOnboarding: asUser, frozen, endingSoon };
  }, [sortedUsers]);

  if (isLoading) return <Loader size="large" />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-5"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">מתאמנים</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ניהול ומעקב אחרי כל המתאמנים שלך
          </p>
        </div>
        <button
          data-testid="users-add-button"
          onClick={() => navigate(`/users/add`)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <FaPlus size={11} />
          <span>מתאמן חדש</span>
        </button>
      </div>

      {/* Stats summary — 4 cards (סה״כ removed per Avihu: redundant
          with the breakdown below it). */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="פעילים" value={stats.active} color="text-emerald-600" />
        <StatCard label="משתמשים" value={stats.inOnboarding} color="text-blue-600" />
        <StatCard label="בהקפאה" value={stats.frozen} color="text-cyan-600" />
        <StatCard label="מסתיימים השבוע" value={stats.endingSoon} color="text-rose-600" />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FaMagnifyingGlass
            size={12}
            className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם / סוג תוכנית / אימייל / טלפון"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 ps-10 pe-4 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
          {(["הכל", "פעיל", "משתמשים", "הקפאה", "מסתיים בקרוב", "ללא תאריך סיום"] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {s}
              </button>
            )
          )}
        </div>
      </div>

      {/* Cards — scrollable inner section, subtle scrollbar */}
      <div className="users-cards-scroll max-h-[calc(100vh-360px)] overflow-y-auto pe-2 -me-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onView={() => navigate(`/users/${user._id}?tab=${weightTab}`, { state: user })}
            />
          ))}
        </div>
      </div>

      <style>{`
        .users-cards-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .users-cards-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .users-cards-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        .users-cards-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.5);
        }
        .users-cards-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
        }
      `}</style>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-12 text-center text-sm text-slate-400 dark:text-slate-500">
          לא נמצאו מתאמנים תואמים
        </div>
      )}
    </div>
  );
};

// =========== Card components ===========

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function UserCard({ user, onView }: { user: IUser; onView: () => void }) {
  const initials = ((user.firstName?.[0] || "") + (user.lastName?.[0] || "")).toUpperCase() || "?";

  const daysLeft = user.dateFinished
    ? DateUtils.getDaysDifference(new Date(), user.dateFinished)
    : null;

  const isExpiringSoon = daysLeft !== null && daysLeft <= MINIMUM_WARNING_DAYS && daysLeft >= 0;

  // Use the *derived* status (lib/userStatus). This is the single
  // source of truth — same logic as the home dashboard cards, the
  // status badge on the trainee profile page, and the stats counts
  // up-top. The card used to show only "פעיל" / "כבוי" with a raw
  // hasAccess check, which misclassified everyone with status "user"
  // as "פעיל" (and broke the "משתמשים" filter visually).
  const derived = deriveAccountStatus(user);
  const status =
    derived === "active"
      ? "פעיל"
      : derived === "user"
        ? "משתמש"
        : derived === "frozen"
          ? "הקפאה"
          : "כבוי";

  const statusColors =
    derived === "disabled"
      ? {
          dot: "bg-rose-500",
          bg: "bg-rose-50 dark:bg-rose-950/40",
          text: "text-rose-700 dark:text-rose-300",
        }
      : derived === "user"
        ? {
            dot: "bg-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950/40",
            text: "text-blue-700 dark:text-blue-300",
          }
        : derived === "frozen"
          ? {
              dot: "bg-cyan-500",
              bg: "bg-cyan-50 dark:bg-cyan-950/40",
              text: "text-cyan-700 dark:text-cyan-300",
            }
          : {
              dot: "bg-emerald-500",
              bg: "bg-emerald-50 dark:bg-emerald-950/40",
              text: "text-emerald-700 dark:text-emerald-300",
            };

  return (
    <div
      className={`group relative flex flex-col gap-3 rounded-2xl border bg-white dark:bg-slate-900 p-5 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        isExpiringSoon
          ? "border-rose-300 hover:border-rose-400"
          : "border-slate-200/80 dark:border-slate-800/80 hover:border-blue-300"
      }`}
    >
      <button
        onClick={onView}
        className="absolute inset-0 z-0 cursor-pointer rounded-2xl"
        aria-label={`פתח את הפרופיל של ${user.firstName} ${user.lastName}`}
      />

      <div className="relative z-10 flex items-start justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-400 text-base font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.planType || "—"}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full ${statusColors.bg} px-2 py-0.5 text-[10px] font-semibold ${statusColors.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
          {status}
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs pointer-events-none">
        <div>
          <p className="text-slate-400 dark:text-slate-500">תחילת ליווי</p>
          <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-100">
            {user.dateJoined ? DateUtils.formatDate(user.dateJoined, "DD/MM/YYYY") : "—"}
          </p>
        </div>
        <div>
          <p className="text-slate-400 dark:text-slate-500">סיום ליווי</p>
          <p
            className={`mt-0.5 font-bold ${
              isExpiringSoon ? "text-rose-600" : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {user.dateFinished ? DateUtils.formatDate(user.dateFinished, "DD/MM/YYYY") : "—"}
          </p>
        </div>
        <div>
          <p className="text-slate-400 dark:text-slate-500">טלפון</p>
          <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-100" dir="ltr">
            {user.phone || "—"}
          </p>
        </div>
        <div>
          <p className="text-slate-400 dark:text-slate-500">אימייל</p>
          <p className="mt-0.5 truncate font-bold text-slate-800 dark:text-slate-100" dir="ltr">
            {user.email || "—"}
          </p>
        </div>
      </div>

      {isExpiringSoon && (
        <div className="relative z-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 px-2 py-1 text-center text-[11px] font-semibold text-rose-700 dark:text-rose-300 pointer-events-none">
          ⚠️ הליווי מסתיים בעוד {daysLeft} ימים
        </div>
      )}

      <div className="relative z-10 flex items-center justify-end gap-2 pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
        >
          פרופיל מלא ←
        </button>
      </div>
    </div>
  );
}
