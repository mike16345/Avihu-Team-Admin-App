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
      <div className="relative grid grid-flow-col auto-cols-fr rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-1.5 shadow-sm w-full max-w-md">
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 shadow-sm transition-all duration-300 ease-out"
          style={{
            width: `calc((100% - 0.75rem) / ${MODES.length})`,
            right: `calc(0.375rem + ${activeIndex} * ((100% - 0.75rem) / ${MODES.length}))`,
          }}
        />
        {MODES.map((m) => {
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`relative z-10 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                isActive
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
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
