import React from "react";
import { FaChevronDown, FaXmark } from "react-icons/fa6";

const getSectionDividerClassName = (isLast?: boolean) => {
  if (isLast) return "";

  return "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-l after:from-transparent after:via-slate-200/80 after:to-transparent dark:after:via-slate-700/60";
};

const getChevronClassName = (open: boolean) => {
  if (open) return "rotate-180";
  return "";
};

export const ActiveChip: React.FC<{ label: string; onRemove: () => void }> = ({
  label,
  onRemove,
}) => (
  <span className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`הסר ${label}`}
      className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-blue-500 transition-colors hover:bg-blue-200 hover:text-blue-800 dark:hover:bg-blue-900"
    >
      <FaXmark size={8} />
    </button>
  </span>
);

export const FilterSection: React.FC<{
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  open: boolean;
  onToggle: () => void;
  isLast?: boolean;
  children: React.ReactNode;
}> = ({ label, icon, count, open, onToggle, isLast, children }) => (
  <div className={`relative ${getSectionDividerClassName(isLast)}`}>
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-2 py-4 text-right transition-colors hover:text-blue-700"
    >
      <span className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          {icon}
        </span>
        {label}
        {count > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </span>
      <FaChevronDown
        size={11}
        className={`text-slate-400 transition-transform ${getChevronClassName(open)}`}
      />
    </button>
    {open && <div className="pb-4 pt-1">{children}</div>}
  </div>
);
