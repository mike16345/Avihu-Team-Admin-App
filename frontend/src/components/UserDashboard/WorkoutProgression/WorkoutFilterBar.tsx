import { FaNoteSticky } from "react-icons/fa6";

type WorkoutFilterBarProps = {
  availableGroups: string[];
  filter: string;
  onFilterChange: (group: string) => void;
};

const getFilterButtonClassName = (isActive: boolean) => {
  if (isActive) return "bg-blue-600 text-white shadow-sm";
  return "text-slate-600 dark:text-slate-300 hover:bg-slate-100";
};

export function WorkoutFilterBar({
  availableGroups,
  filter,
  onFilterChange,
}: WorkoutFilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-3 py-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-1">
        {availableGroups.map((group) => (
          <button
            key={group}
            onClick={() => onFilterChange(group)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${getFilterButtonClassName(
              filter === group
            )}`}
          >
            {group}
          </button>
        ))}
      </div>
      <a
        href="#progress-note"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-slate-800"
      >
        <FaNoteSticky size={11} />
        <span>פתק התקדמות</span>
      </a>
    </div>
  );
}
