import React from "react";
import { FaChevronDown, FaChevronUp, FaXmark } from "react-icons/fa6";

export const DietPickerFilterSection: React.FC<{
  id: string;
  title: string;
  count: number;
  expanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}> = ({ id, title, count, expanded, onToggle, children }) => {
  const ChevronIcon = expanded ? FaChevronUp : FaChevronDown;

  return (
    <div className="rounded-xl">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm font-bold text-slate-800 transition-colors hover:bg-white/50 dark:text-slate-200 dark:hover:bg-slate-800/40"
      >
        <span className="flex items-center gap-2">
          {title}
          {count > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </span>
        <ChevronIcon size={10} />
      </button>
      {expanded && <div className="px-2 pb-3 pt-1">{children}</div>}
    </div>
  );
};

export const DietPickerChipGrid = <T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((option) => {
      const selectedOption = selected.includes(option.value);

      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onToggle(option.value)}
          className={`h-7 rounded-md border px-2.5 text-xs font-bold transition-all ${
            selectedOption
              ? "border-blue-600 bg-blue-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export const DietPickerActiveChip: React.FC<{ label: string; onRemove: () => void }> = ({
  label,
  onRemove,
}) => (
  <button
    type="button"
    onClick={onRemove}
    className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300"
  >
    <span>{label}</span>
    <FaXmark size={9} />
  </button>
);
