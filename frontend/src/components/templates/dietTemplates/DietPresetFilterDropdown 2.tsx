import React, { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";

export type DietFilterTone =
  | "blue"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "sky"
  | "indigo"
  | "pink"
  | "orange";

const TONE_STYLES: Record<
  DietFilterTone,
  { iconText: string; idleBg: string; idleBorder: string; hover: string }
> = {
  blue: {
    iconText: "text-blue-600 dark:text-blue-300",
    idleBg: "bg-blue-50/60 dark:bg-blue-950/30",
    idleBorder: "border-blue-100 dark:border-blue-900/60",
    hover: "hover:bg-blue-100/60 hover:border-blue-300",
  },
  amber: {
    iconText: "text-amber-600 dark:text-amber-300",
    idleBg: "bg-amber-50/60 dark:bg-amber-950/30",
    idleBorder: "border-amber-100 dark:border-amber-900/60",
    hover: "hover:bg-amber-100/60 hover:border-amber-300",
  },
  violet: {
    iconText: "text-violet-600 dark:text-violet-300",
    idleBg: "bg-violet-50/60 dark:bg-violet-950/30",
    idleBorder: "border-violet-100 dark:border-violet-900/60",
    hover: "hover:bg-violet-100/60 hover:border-violet-300",
  },
  rose: {
    iconText: "text-rose-600 dark:text-rose-300",
    idleBg: "bg-rose-50/60 dark:bg-rose-950/30",
    idleBorder: "border-rose-100 dark:border-rose-900/60",
    hover: "hover:bg-rose-100/60 hover:border-rose-300",
  },
  emerald: {
    iconText: "text-emerald-600 dark:text-emerald-300",
    idleBg: "bg-emerald-50/60 dark:bg-emerald-950/30",
    idleBorder: "border-emerald-100 dark:border-emerald-900/60",
    hover: "hover:bg-emerald-100/60 hover:border-emerald-300",
  },
  sky: {
    iconText: "text-sky-600 dark:text-sky-300",
    idleBg: "bg-sky-50/60 dark:bg-sky-950/30",
    idleBorder: "border-sky-100 dark:border-sky-900/60",
    hover: "hover:bg-sky-100/60 hover:border-sky-300",
  },
  indigo: {
    iconText: "text-indigo-600 dark:text-indigo-300",
    idleBg: "bg-indigo-50/60 dark:bg-indigo-950/30",
    idleBorder: "border-indigo-100 dark:border-indigo-900/60",
    hover: "hover:bg-indigo-100/60 hover:border-indigo-300",
  },
  pink: {
    iconText: "text-pink-600 dark:text-pink-300",
    idleBg: "bg-pink-50/60 dark:bg-pink-950/30",
    idleBorder: "border-pink-100 dark:border-pink-900/60",
    hover: "hover:bg-pink-100/60 hover:border-pink-300",
  },
  orange: {
    iconText: "text-orange-600 dark:text-orange-300",
    idleBg: "bg-orange-50/60 dark:bg-orange-950/30",
    idleBorder: "border-orange-100 dark:border-orange-900/60",
    hover: "hover:bg-orange-100/60 hover:border-orange-300",
  },
};

const getDropdownButtonClassName = (active: boolean, open: boolean, tone: DietFilterTone) => {
  if (active) {
    return "border-transparent brand-gradient text-white shadow-md hover:shadow-lg hover:-translate-y-0.5";
  }

  const toneStyle = TONE_STYLES[tone];

  if (open) {
    return `${toneStyle.idleBorder} ${toneStyle.idleBg} text-slate-700 shadow-sm dark:text-slate-100`;
  }

  return `${toneStyle.idleBorder} ${toneStyle.idleBg} ${toneStyle.hover} text-slate-700 hover:shadow-sm hover:-translate-y-0.5 dark:text-slate-100`;
};

const getIconClassName = (active: boolean, tone: DietFilterTone) => {
  if (active) return "text-white/90";
  return TONE_STYLES[tone].iconText;
};

const getChevronClassName = (active: boolean, open: boolean) => {
  const colorClassName = active ? "text-white/80" : "text-slate-400";
  const rotationClassName = open ? "rotate-180" : "";

  return `transition-transform ${rotationClassName} ${colorClassName}`;
};

const getOptionClassName = (selected: boolean) => {
  if (selected) {
    return "bg-blue-50 font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
  }

  return "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800";
};

const getCheckboxClassName = (selected: boolean) => {
  if (selected) return "border-blue-600 bg-blue-600 text-white";

  return "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900";
};

type DietPresetFilterDropdownProps<T extends string> = {
  label: string;
  icon?: React.ReactNode;
  tone?: DietFilterTone;
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
};

const DietPresetFilterDropdown = <T extends string>({
  label,
  icon,
  tone = "blue",
  options,
  selected,
  onToggle,
}: DietPresetFilterDropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = selected.length > 0;

  useEffect(() => {
    if (!open) return;

    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`group inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all duration-200 ${getDropdownButtonClassName(
          active,
          open,
          tone
        )}`}
      >
        {icon && (
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md transition-transform group-hover:scale-110 ${getIconClassName(
              active,
              tone
            )}`}
          >
            {icon}
          </span>
        )}
        {label}
        {selected.length > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/25 px-1.5 text-[10px] font-bold text-white ring-1 ring-white/40 backdrop-blur">
            {selected.length}
          </span>
        )}
        <FaChevronDown size={9} className={getChevronClassName(active, open)} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-30 mt-2 flex min-w-[200px] flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          {selected.length > 0 && (
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-2 py-1.5 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {label}
              </span>
              <button
                type="button"
                onClick={() => selected.forEach(onToggle)}
                className="text-[10px] font-bold text-slate-500 hover:text-rose-600"
              >
                נקה
              </button>
            </div>
          )}
          <ul className="max-h-72 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);

              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => onToggle(option.value)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-right text-xs transition-colors ${getOptionClassName(
                      isSelected
                    )}`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${getCheckboxClassName(
                        isSelected
                      )}`}
                    >
                      {isSelected && (
                        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                          <path
                            d="M2.5 6.5L5 9l4.5-5.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="flex-1">{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DietPresetFilterDropdown;
