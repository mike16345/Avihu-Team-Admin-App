import React from "react";
import { FaPlus } from "react-icons/fa6";

type FieldProps = {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  isLast?: boolean;
};

const getFieldDividerClassName = (isLast?: boolean) => {
  if (isLast) return "";

  return "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-l after:from-transparent after:via-slate-200/80 after:to-transparent dark:after:via-slate-700/60";
};

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ icon, label, children, isLast }, ref) => {
    const dividerClassName = getFieldDividerClassName(isLast);

    return (
      <div ref={ref} className={`relative flex flex-col gap-2 py-3 ${dividerClassName}`}>
        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-200">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60">
            {icon}
          </span>
          {label}
        </label>
        <div>{children}</div>
      </div>
    );
  }
);
Field.displayName = "Field";

const getSummaryChipToneClassName = (tone: "blue" | "rose") => {
  if (tone === "rose") {
    return "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300";
  }

  return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300";
};

export function SummaryChip({
  icon,
  label,
  onClick,
  tone = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: "blue" | "rose";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${getSummaryChipToneClassName(
        tone
      )}`}
    >
      {icon}
      <span className="max-w-[180px] truncate">{label}</span>
    </button>
  );
}

export function GhostChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 dark:border-slate-700 bg-transparent px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 transition-colors hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700"
    >
      <FaPlus size={8} />
      {label}
    </button>
  );
}
