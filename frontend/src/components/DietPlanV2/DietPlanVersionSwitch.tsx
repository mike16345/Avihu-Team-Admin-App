interface DietPlanVersionSwitchProps {
  value: 1 | 2;
  onChange: (version: 1 | 2) => void;
  compact?: boolean;
}

const DietPlanVersionSwitch: React.FC<DietPlanVersionSwitchProps> = ({
  value,
  onChange,
  compact = false,
}) => (
  <div
    role="group"
    aria-label="גרסת תפריט"
    className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1 shadow-inner dark:border-slate-700 dark:bg-slate-800"
  >
    {([1, 2] as const).map((version) => (
      <button
        key={version}
        type="button"
        aria-pressed={value === version}
        onClick={() => onChange(version)}
        className={`rounded-lg font-extrabold transition-all ${compact ? "px-3 py-1 text-[11px]" : "px-4 py-1.5 text-xs"} ${
          value === version
            ? "bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300"
            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
        }`}
      >
        {version === 1 ? "תפריט מנות" : "תפריט מאקרו"}
      </button>
    ))}
  </div>
);

export default DietPlanVersionSwitch;
