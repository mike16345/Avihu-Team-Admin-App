import { useState } from "react";
import { FaDumbbell, FaPersonRunning, FaClipboardCheck } from "react-icons/fa6";

type TabKey = "workout" | "cardio" | "tips";

interface WorkoutTabsProps {
  workoutPlan: React.ReactNode;
  cardioPlan: React.ReactNode;
  tips: React.ReactNode;
  header?: React.ReactNode;
  blocksBar?: React.ReactNode;
}

const TABS: { id: TabKey; label: string; icon: React.ReactNode }[] = [
  { id: "workout", label: "אימונים", icon: <FaDumbbell size={13} /> },
  { id: "cardio", label: "אירובי", icon: <FaPersonRunning size={13} /> },
  { id: "tips", label: "דגשים", icon: <FaClipboardCheck size={13} /> },
];

const WorkoutTabs: React.FC<WorkoutTabsProps> = ({
  workoutPlan,
  cardioPlan,
  tips,
  header,
  blocksBar,
}) => {
  const [tab, setTab] = useState<TabKey>("workout");
  const activeIndex = TABS.findIndex((t) => t.id === tab);

  return (
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
      {header}
      <div className="relative grid grid-flow-col auto-cols-fr rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-1.5 shadow-sm w-fit min-w-[320px]">
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 shadow-sm transition-all duration-300 ease-out"
          style={{
            width: `calc((100% - 0.75rem) / ${TABS.length})`,
            right: `calc(0.375rem + ${activeIndex} * ((100% - 0.75rem) / ${TABS.length}))`,
          }}
        />
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative z-10 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                active
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              <span
                className={`transition-colors duration-300 ${
                  active ? "text-blue-700 dark:text-blue-300" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {t.icon}
              </span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {blocksBar}

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
