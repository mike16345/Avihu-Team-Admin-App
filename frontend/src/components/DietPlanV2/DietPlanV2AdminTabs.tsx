import { NavLink } from "react-router-dom";
import { BookOpen, LayoutTemplate } from "lucide-react";

const tabs = [
  {
    label: "תבניות V2",
    to: "/dietPlans?version=2",
    icon: LayoutTemplate,
    activeKey: "presets",
  },
  {
    label: "מאגר מזון",
    to: "/presets/admin/food-catalog",
    icon: BookOpen,
    activeKey: "catalog",
  },
] as const;

interface DietPlanV2AdminTabsProps {
  active: "presets" | "catalog";
}

const DietPlanV2AdminTabs = ({ active }: DietPlanV2AdminTabsProps) => (
  <nav
    data-testid="diet-plan-admin-v2-tabs"
    aria-label="ניהול תפריטי V2"
    className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800"
  >
    {tabs.map(({ label, to, icon: Icon, activeKey }) => {
      const selected = active === activeKey;
      return (
        <NavLink
          key={activeKey}
          to={to}
          aria-current={selected ? "page" : undefined}
          className={`flex min-h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all ${
            selected
              ? "bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      );
    })}
  </nav>
);

export default DietPlanV2AdminTabs;
