/**
 * AdminDashboard — the home page (`/`).
 *
 * Sections:
 *   1. Hero greeting — time-aware "בוקר טוב / צהריים / ערב" + date.
 *   2. Quick actions — 4 colored shortcut cards.
 *   3. Alert pills — compact badges for "ללא אימון", "ללא תזונה",
 *      "מסיימים החודש". Each pops open a small scrollable list.
 *   4. UserCheckIn — main attention card (full width).
 *   5. Two summary charts — plan coverage + expiry timeline.
 */
import Shortcut from "@/components/AdminDashboard/Shortcut";
import UserCheckIn from "@/components/AdminDashboard/UserCheckIn";
import AnalyticsPill from "@/components/AdminDashboard/AnalyticsPill";
import DashboardCharts from "@/components/AdminDashboard/DashboardCharts";
import { QueryKeys } from "@/enums/QueryKeys";
import { useUsersStore } from "@/store/userStore";
import { BiFoodMenu } from "react-icons/bi";
import { FaDumbbell } from "react-icons/fa";
import { FaAppleWhole, FaCalendarXmark } from "react-icons/fa6";
import { FiUserPlus } from "react-icons/fi";
import { MdOutlinePostAdd } from "react-icons/md";
import { FaHouse } from "react-icons/fa6";

const shortcuts: {
  actionName: string;
  description: string;
  navLink: string;
  icon: React.ReactElement;
  tone: "blue" | "emerald" | "purple" | "amber" | "rose";
}[] = [
  {
    actionName: "מתאמן חדש",
    description: "הוסף לקוח לרשימה",
    navLink: "/users/add",
    icon: <FiUserPlus />,
    tone: "blue",
  },
  {
    actionName: "תפריט תזונה",
    description: "צור תבנית תפריט",
    navLink: "/presets/dietPlans",
    icon: <BiFoodMenu />,
    tone: "emerald",
  },
  {
    actionName: "תוכנית אימון",
    description: "צור תבנית אימון",
    navLink: "/presets/workoutPlans/",
    icon: <FaDumbbell />,
    tone: "purple",
  },
  {
    actionName: "מאמר חדש",
    description: "פרסם תוכן באפליקציה",
    navLink: "/blogs/create",
    icon: <MdOutlinePostAdd />,
    tone: "amber",
  },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6) return "לילה טוב";
  if (h < 12) return "בוקר טוב";
  if (h < 17) return "צהריים טובים";
  if (h < 21) return "ערב טוב";
  return "לילה טוב";
};

const AdminDashboard = () => {
  const currentUser = useUsersStore((state) => state.currentUser);
  const firstName = currentUser?.firstName?.trim();
  const today = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div
      data-testid="admin-dashboard"
      dir="rtl"
      className="flex flex-col gap-6"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      {/* Hero greeting */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60 dark:ring-blue-900/40">
            <FaHouse size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {getGreeting()}
              {firstName ? `, ${firstName}` : ""} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{today}</p>
          </div>
        </div>
      </header>

      {/* Quick actions */}
      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          פעולות מהירות
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((item) => (
            <Shortcut
              key={item.navLink}
              actionName={item.actionName}
              description={item.description}
              icon={item.icon}
              navLink={item.navLink}
              tone={item.tone}
            />
          ))}
        </div>
      </section>

      {/* Two-column: UserCheckIn (right/main) + alerts+charts (left) */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Right column — main card */}
        <UserCheckIn />

        {/* Left column — alerts + charts stacked */}
        <div className="flex flex-col gap-5">
          {/* Alert pills under "דורשי טיפול" heading */}
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              דורשי טיפול
            </p>
            <div className="flex flex-wrap gap-2">
              <AnalyticsPill
                icon={<FaDumbbell size={13} />}
                label="ללא אימון"
                dataKey={QueryKeys.NO_WORKOUT_PLAN}
                activeBg="bg-purple-50 dark:bg-purple-950/40"
                activeText="text-purple-700 dark:text-purple-300"
                activeRing="border-purple-300 dark:border-purple-700"
              />
              <AnalyticsPill
                icon={<FaAppleWhole size={13} />}
                label="ללא תזונה"
                dataKey={QueryKeys.NO_DIET_PLAN}
                activeBg="bg-emerald-50 dark:bg-emerald-950/40"
                activeText="text-emerald-700 dark:text-emerald-300"
                activeRing="border-emerald-300 dark:border-emerald-700"
              />
              <AnalyticsPill
                icon={<FaCalendarXmark size={13} />}
                label="מסיימים החודש"
                dataKey={QueryKeys.EXPIRING_USERS}
                activeBg="bg-rose-50 dark:bg-rose-950/40"
                activeText="text-rose-700 dark:text-rose-300"
                activeRing="border-rose-300 dark:border-rose-700"
              />
            </div>
          </div>

          {/* Charts */}
          <DashboardCharts />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
