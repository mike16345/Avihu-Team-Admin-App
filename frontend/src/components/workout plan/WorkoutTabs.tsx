/**
 * WorkoutTabs — redesigned pill-style tabs for the workout plan editor.
 *
 * Three sections: אימונים (workouts), אירובי (cardio), דגשים (tips).
 * Matches the rest of the admin redesign — Heebo, slate-200/80 borders,
 * blue-600 active pill, rounded-2xl card wrapping the tab list.
 */
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

const WorkoutTabs: React.FC<WorkoutTabsProps> = ({ workoutPlan, cardioPlan, tips }) => {
  const [tab, setTab] = useState<TabKey>("workout");

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-4"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-1.5 shadow-sm w-fit">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              <span className={active ? "text-white" : "text-slate-500 dark:text-slate-400"}>{t.icon}</span>
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
