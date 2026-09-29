import React from "react";
import type { WorkoutPlanMode } from "@/interfaces/IWorkoutPlan";

interface WorkoutModeToggleProps {
  mode: WorkoutPlanMode;
  onChange: (mode: WorkoutPlanMode) => void;
}

const MODES: { id: WorkoutPlanMode; label: string }[] = [
  { id: "unified", label: "אימון אחיד" },
  { id: "blocks", label: "אימון לפי בלוקים" },
];

const WorkoutModeToggle: React.FC<WorkoutModeToggleProps> = ({ mode, onChange }) => {
  const activeIndex = MODES.findIndex((m) => m.id === mode);

  return (
    <div dir="rtl" className="flex justify-center font-heebo">
      <div className="relative grid grid-flow-col auto-cols-fr rounded-full border border-[#E6ECF2] dark:border-slate-800/70 bg-white/95 dark:bg-slate-900/90 p-1 shadow-[0_4px_20px_-12px_rgba(30,50,70,0.10)] backdrop-blur-sm w-full max-w-md">
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-[#EAF3FF] dark:bg-slate-800/70 transition-all duration-300 ease-out"
          style={{
            width: `calc((100% - 0.5rem) / ${MODES.length})`,
            right: `calc(0.25rem + ${activeIndex} * ((100% - 0.5rem) / ${MODES.length}))`,
          }}
        />
        {MODES.map((m) => {
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`relative z-10 inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 ${
                isActive ? "text-[#172B4D] dark:text-slate-50" : "text-[#667085] hover:text-[#172B4D]"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorkoutModeToggle;
