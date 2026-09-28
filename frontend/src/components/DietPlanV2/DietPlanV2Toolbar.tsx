import { FaCheck } from "react-icons/fa6";

interface TabButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  /** When true, the button flashes red + shakes to grab attention.
   *  Re-mount it (via a changing `key` prop from the parent) to
   *  restart the animation on repeat triggers. */
  attention?: boolean;
}

// All tabs share the brand-blue active state — colour swaps by tab
// add noise without communicating anything about the tab's role.
const TAB_ACTIVE_CLASS = "brand-gradient text-white shadow-md shadow-blue-500/25";
const TAB_ATTENTION_CLASS =
  "border-rose-500 bg-rose-100 text-rose-700 shadow-md shadow-rose-500/30 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-300 animate-dietv2-shake";
const TAB_IDLE_CLASS =
  "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

const getTabClass = (active: boolean, attention: boolean | undefined): string => {
  if (active) return `${TAB_ACTIVE_CLASS} border-transparent`;
  if (attention) return TAB_ATTENTION_CLASS;

  return TAB_IDLE_CLASS;
};

export const TabButton: React.FC<TabButtonProps> = ({
  active,
  icon,
  label,
  onClick,
  attention,
}) => (
  <button
    type="button"
    onClick={onClick}
    // Attention state wins over the idle state, but active still
    // wins over both — an already-open tab shouldn't fight itself.
    // Active tab renders at the larger tier so the currently-open
    // section reads as the primary control in this row; idle tabs
    // shrink to a compact chip. Size + colour transition together.
    className={`inline-flex items-center rounded-xl border font-bold transition-all hover:-translate-y-0.5 ${
      active ? "gap-1.5 px-3.5 py-2 text-[13px]" : "gap-1.5 px-3 py-2 text-xs"
    } ${getTabClass(active, attention)}`}
  >
    {icon}
    {label}
  </button>
);

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  tone?: "default" | "brand";
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  disabled,
  title,
  tone,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    // min-w keeps every toolbar button the same width regardless of
    // label length; justify-center keeps the icon+label pair centred
    // so short labels don't hug the right edge in RTL.
    className={`inline-flex min-w-[7.5rem] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${
      tone === "brand"
        ? "border-blue-300 bg-blue-600 text-white shadow-sm shadow-blue-500/30 hover:bg-blue-700"
        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    }`}
  >
    {icon}
    {label}
  </button>
);

export const SaveIndicator: React.FC<{ saved: boolean }> = ({ saved }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition-colors ${
      saved
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
        : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
    }`}
    title={saved ? "כל השינויים נשמרו מקומית" : "שומר…"}
  >
    {saved ? <FaCheck size={9} /> : <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />}
    {saved ? "נשמר" : "שומר…"}
  </span>
);
