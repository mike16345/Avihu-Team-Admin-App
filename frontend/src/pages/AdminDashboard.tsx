import type { ReactElement } from "react";
import Shortcut from "@/components/AdminDashboard/Shortcut";
import UserCheckIn from "@/components/AdminDashboard/UserCheckIn";
import NewClientsCard from "@/components/AdminDashboard/NewClientsCard";
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
  icon: ReactElement;
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
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md shadow-blue-600/20">
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

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UserCheckIn />
        <NewClientsCard />
      </section>
    </div>
  );
};

export default AdminDashboard;
