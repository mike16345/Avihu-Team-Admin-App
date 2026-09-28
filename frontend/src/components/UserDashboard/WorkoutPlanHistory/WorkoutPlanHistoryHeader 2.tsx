import { KeyboardEvent } from "react";
import { FaClockRotateLeft } from "react-icons/fa6";

import { cn } from "@/lib/utils";

type WorkoutPlanHistoryHeaderProps = {
  historyCount: number;
  expanded: boolean;
  onToggleExpanded: () => void;
};

const getCountLabel = (historyCount: number) => {
  if (historyCount === 0) return "";
  return `(${historyCount})`;
};

const getExpandGlyph = (expanded: boolean) => {
  if (expanded) return "▴";
  return "▾";
};

const getHeaderRole = (hasHistory: boolean) => {
  if (hasHistory) return "button";
  return undefined;
};

const getHeaderTabIndex = (hasHistory: boolean) => {
  if (hasHistory) return 0;
  return undefined;
};

export function WorkoutPlanHistoryHeader({
  historyCount,
  expanded,
  onToggleExpanded,
}: WorkoutPlanHistoryHeaderProps) {
  const hasHistory = historyCount > 0;
  const role = getHeaderRole(hasHistory);
  const tabIndex = getHeaderTabIndex(hasHistory);
  let handleClick: (() => void) | undefined;

  if (hasHistory) {
    handleClick = onToggleExpanded;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!hasHistory) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    onToggleExpanded();
  };

  return (
    <header
      role={role}
      tabIndex={tabIndex}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex items-center justify-between gap-3",
        hasHistory && "cursor-pointer select-none"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
          <FaClockRotateLeft size={12} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            היסטוריית תוכניות
          </h3>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            {getCountLabel(historyCount)}
          </span>
        </div>
      </div>

      {hasHistory && (
        <span
          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 dark:text-slate-500 transition-transform"
          aria-hidden
        >
          {getExpandGlyph(expanded)}
        </span>
      )}
    </header>
  );
}
