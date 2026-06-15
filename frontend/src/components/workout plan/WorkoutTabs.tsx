import { useState } from "react";
import { FaDumbbell, FaPersonRunning, FaClipboardCheck } from "react-icons/fa6";

type TabKey = "workout" | "cardio" | "tips";

interface WorkoutTabsProps {
  workoutPlan: React.ReactNode;
  cardioPlan: React.ReactNode;
  tips: React.ReactNode;
}

const TABS: { id: TabKey; label: string; icon: React.ReactNode }[] = [
  { id: "workout", label: "אימונים", icon: <FaDumbbell size={13} /> },
  { id: "cardio", label: "אירובי", icon: <FaPersonRunning size={13} /> },
  { id: "tips", label: "דגשים", icon: <FaClipboardCheck size={13} /> },
];

const getTabButtonClassName = (active: boolean) => {
  if (active) return "bg-blue-600 text-white shadow-sm";
  return "text-slate-600 dark:text-slate-300 hover:bg-slate-100";
};

const getTabIconClassName = (active: boolean) => {
  if (active) return "text-white";
  return "text-slate-500 dark:text-slate-400";
};

const WorkoutTabs: React.FC<WorkoutTabsProps> = ({ workoutPlan, cardioPlan, tips }) => {
  const [tab, setTab] = useState<TabKey>("workout");

  return (
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-1.5 shadow-sm w-fit">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${getTabButtonClassName(
                active
              )}`}
            >
              <span className={getTabIconClassName(active)}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div>
        {tab === "workout" && workoutPlan}
        {tab === "cardio" && cardioPlan}
        {tab === "tips" && (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
            {tips}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTabs;
