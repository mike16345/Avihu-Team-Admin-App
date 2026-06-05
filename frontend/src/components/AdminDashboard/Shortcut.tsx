/**
 * Shortcut — quick-action card on the home dashboard.
 *
 * Visual refresh:
 *  - Rounded-2xl white card with thin slate border + soft shadow
 *  - Colored icon avatar (tone passed in)
 *  - Title + small subtitle, hover lifts the card slightly
 */
import React, { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";

interface ShortcutProps {
  icon: ReactElement<any, any>;
  actionName: string;
  navLink: string;
  description?: string;
  tone?: "blue" | "emerald" | "purple" | "amber" | "rose";
}

const TONES: Record<
  NonNullable<ShortcutProps["tone"]>,
  { bg: string; text: string; ring: string }
> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-600 dark:text-blue-300",
    ring: "ring-blue-200/60 dark:ring-blue-900/40",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-200/60 dark:ring-emerald-900/40",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-600 dark:text-purple-300",
    ring: "ring-purple-200/60 dark:ring-purple-900/40",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-300",
    ring: "ring-amber-200/60 dark:ring-amber-900/40",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-600 dark:text-rose-300",
    ring: "ring-rose-200/60 dark:ring-rose-900/40",
  },
};

const Shortcut: React.FC<ShortcutProps> = ({
  icon,
  actionName,
  navLink,
  description,
  tone = "blue",
}) => {
  const navigate = useNavigate();
  const palette = TONES[tone];

  return (
    <button
      type="button"
      onClick={() => navigate(navLink)}
      dir="rtl"
      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
      style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ring-1 ${palette.bg} ${palette.text} ${palette.ring}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
          {actionName}
        </p>
        {description && (
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <FaArrowLeft
        size={11}
        className="shrink-0 text-slate-300 dark:text-slate-600 transition-all group-hover:-translate-x-0.5 group-hover:text-blue-500"
      />
    </button>
  );
};

export default Shortcut;
