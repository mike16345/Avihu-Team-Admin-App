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
      <div className="relative grid grid-flow-col auto-cols-fr rounded-full border border-[#E6ECF2] dark:border-slate-800/70 bg-white/95 dark:bg-slate-900/90 p-1 shadow-[0_4px_20px_-12px_rgba(30,50,70,0.10)] backdrop-blur-sm w-fit min-w-[320px]">
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-[#EAF3FF] dark:bg-slate-800/70 transition-all duration-300 ease-out"
          style={{
            width: `calc((100% - 0.5rem) / ${TABS.length})`,
            right: `calc(0.25rem + ${activeIndex} * ((100% - 0.5rem) / ${TABS.length}))`,
          }}
        />
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`relative z-10 inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 ${
                active
                  ? "text-[#172B4D] dark:text-slate-50"
                  : "text-[#667085] hover:text-[#172B4D]"
              }`}
            >
              <span className="text-[#667085] dark:text-slate-400">{t.icon}</span>
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
          <div className="rounded-[20px] border border-[#E6ECF2] dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-[0_4px_20px_rgba(30,50,70,0.04)]">
            {tips}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTabs;
