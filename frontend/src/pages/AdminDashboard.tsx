/**
 * AdminDashboard — the home page (`/`).
 *
 * Sections (in order):
 *   1. Hero greeting — "שלום {שם}" + time-aware label + soft tagline.
 *   2. Quick actions grid — 4 colored shortcut cards.
 *   3. Two-column attention area:
 *      · Left: clients to check (UserCheckIn)
 *      · Right: rotating analytics carousel (no workout / no diet /
 *        expiring this month) — three coloured AnalyticsCards.
 *
 * No API changes — just a friendlier top-of-app first impression.
 */
import AnalyticsCard from "@/components/AdminDashboard/AnalyticsCard";
import Shortcut from "@/components/AdminDashboard/Shortcut";
import UserCheckIn from "@/components/AdminDashboard/UserCheckIn";
import { QueryKeys } from "@/enums/QueryKeys";
import { useUsersStore } from "@/store/userStore";
import { BiFoodMenu } from "react-icons/bi";
import { FaDumbbell } from "react-icons/fa";
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

/** Returns "בוקר טוב" / "צהריים טובים" / "ערב טוב" by local time. */
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

      {/* Quick action shortcuts */}
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

      {/* Attention area — all four insight cards visible at once.
          Two rows × two columns on lg+; single column on narrow screens. */}
      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          מבט מהיר
        </p>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <UserCheckIn />
          <AnalyticsCard title="ללא תוכנית אימון" dataKey={QueryKeys.NO_WORKOUT_PLAN} />
          <AnalyticsCard title="ללא תפריט תזונה" dataKey={QueryKeys.NO_DIET_PLAN} />
          <AnalyticsCard title="מסיימים תהליך החודש" dataKey={QueryKeys.EXPIRING_USERS} />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
