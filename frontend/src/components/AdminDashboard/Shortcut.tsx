import React, { ReactElement } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutProps {
  icon: ReactElement<any, any>;
  actionName: string;
  navLink: string;
  description?: string;
  tone?: "blue" | "emerald" | "purple" | "amber" | "rose";
}

const TONES: Record<NonNullable<ShortcutProps["tone"]>, { avatar: string; glow: string }> = {
  blue: {
    avatar: "bg-blue-600 text-white",
    glow: "group-hover:shadow-blue-200/70 dark:group-hover:shadow-blue-900/30",
  },
  emerald: {
    avatar: "bg-emerald-600 text-white",
    glow: "group-hover:shadow-emerald-200/70 dark:group-hover:shadow-emerald-900/30",
  },
  purple: {
    avatar: "bg-indigo-600 text-white",
    glow: "group-hover:shadow-indigo-200/70 dark:group-hover:shadow-indigo-900/30",
  },
  amber: {
    avatar: "bg-amber-500 text-white",
    glow: "group-hover:shadow-amber-200/70 dark:group-hover:shadow-amber-900/30",
  },
  rose: {
    avatar: "bg-rose-600 text-white",
    glow: "group-hover:shadow-rose-200/70 dark:group-hover:shadow-rose-900/30",
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
      className={`group flex w-full items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-lg ${palette.glow}`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl shadow-sm transition-transform group-hover:scale-105 ${palette.avatar}`}
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
    </button>
  );
};

export default Shortcut;
