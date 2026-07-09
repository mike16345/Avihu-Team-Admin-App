import { cn } from "@/lib/utils";
import { FaAppleWhole, FaArrowTrendUp, FaClipboardList, FaDumbbell, FaUser } from "react-icons/fa6";
import type { MainTab, ProgressSubTab } from "./userDashboardTypes";

const mainTabs: { id: MainTab; label: string; icon: JSX.Element }[] = [
  { id: "progress", label: "התקדמות", icon: <FaArrowTrendUp size={14} /> },
  { id: "workout", label: "תוכנית אימונים", icon: <FaDumbbell size={14} /> },
  { id: "diet", label: "תפריט תזונה", icon: <FaAppleWhole size={14} /> },
  { id: "forms", label: "שאלונים", icon: <FaClipboardList size={14} /> },
];

const progressSubTabs: { id: ProgressSubTab; label: string }[] = [
  { id: "weight", label: "משקל" },
  { id: "strength", label: "כוח" },
  { id: "steps", label: "מעקב צעדים" },
  { id: "photos", label: "תמונות" },
  { id: "measurements", label: "היקפים" },
];

interface UserDashboardTabsProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

interface ProgressSubTabsProps {
  activeSubTab: ProgressSubTab;
  onSubTabChange: (subTab: ProgressSubTab) => void;
}

export function UserDashboardTabs({ activeTab, onTabChange }: UserDashboardTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-start gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-5 py-3 shadow-sm">
      <button
        onClick={() => onTabChange("profile")}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border-l border-slate-200 dark:border-slate-800 px-4 py-2 pl-5 text-sm font-semibold transition-all",
          activeTab === "profile"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-700 dark:text-slate-200 hover:bg-slate-100"
        )}
      >
        <FaUser
          size={14}
          className={activeTab === "profile" ? "text-white" : "text-slate-500 dark:text-slate-400"}
        />
        <span>פרופיל מתאמן</span>
      </button>
      <div className="flex items-center gap-1">
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              )}
            >
              <span>{tab.label}</span>
              <span className={isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}>
                {tab.icon}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProgressSubTabs({ activeSubTab, onSubTabChange }: ProgressSubTabsProps) {
  return (
    <div className="flex w-fit items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
      {progressSubTabs.map((subTab) => (
        <button
          key={subTab.id}
          onClick={() => onSubTabChange(subTab.id)}
          className={cn(
            "rounded-lg px-4 py-1.5 text-sm font-semibold transition-all",
            activeSubTab === subTab.id
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          {subTab.label}
        </button>
      ))}
    </div>
  );
}
