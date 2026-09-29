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
  { id: "appFeedback", label: "פידבק אפליקציה" },
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
  const activeItemClasses =
    "bg-slate-100/90 text-slate-900 dark:bg-slate-800/70 dark:text-slate-50";
  const idleItemClasses =
    "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/40";

  return (
    <div className="mx-auto flex w-fit max-w-full flex-wrap items-center gap-1 rounded-full border border-slate-200/70 bg-white/95 px-2.5 py-1.5 shadow-[0_6px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-slate-800/70 dark:bg-slate-900/90">
      <button
        onClick={() => onTabChange("profile")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          activeTab === "profile" ? activeItemClasses : idleItemClasses
        )}
      >
        <FaUser size={13} className="text-slate-500 dark:text-slate-400" />
        <span>פרופיל מתאמן</span>
      </button>
      <span
        aria-hidden
        className="mx-1 h-5 w-px shrink-0 bg-slate-200 dark:bg-slate-700/70"
      />
      {mainTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive ? activeItemClasses : idleItemClasses
            )}
          >
            <span>{tab.label}</span>
            <span className="text-slate-500 dark:text-slate-400">{tab.icon}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ProgressSubTabs({ activeSubTab, onSubTabChange }: ProgressSubTabsProps) {
  return (
    <div className="mx-auto flex w-fit max-w-full items-center gap-0.5 rounded-full border border-[#E8EDF2] dark:border-slate-800/70 bg-white/95 dark:bg-slate-900/90 p-0.5 shadow-[0_4px_20px_-12px_rgba(30,50,70,0.10)] backdrop-blur-sm">
      {progressSubTabs.map((subTab) => (
        <button
          key={subTab.id}
          onClick={() => onSubTabChange(subTab.id)}
          className={cn(
            "rounded-full px-3.5 py-1 text-xs font-medium transition-colors",
            activeSubTab === subTab.id
              ? "bg-[#EAF2F7] text-slate-900 dark:bg-slate-800/70 dark:text-slate-50"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
          )}
        >
          {subTab.label}
        </button>
      ))}
    </div>
  );
}
