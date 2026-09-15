import { FaCheck } from "react-icons/fa6";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
  value: string;
  label: string;
}

interface Props {
  placeholder: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  minWidth?: number;
}

const DietPlanV2TemplateFilterMultiSelect: React.FC<Props> = ({
  placeholder,
  options,
  selected,
  onChange,
  minWidth = 140,
}) => {
  const toggle = (value: string) => {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  };
  const clear = () => onChange([]);

  const summary = summarise(selected, options, placeholder);
  const active = selected.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          style={{ minWidth }}
          className={`relative flex h-9 items-center justify-between gap-2 rounded-lg border px-2.5 text-[13px] font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200/60 ${
            active
              ? "border-blue-500 bg-blue-50/60 text-slate-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-slate-100"
              : "border-blue-200 bg-white text-slate-500 hover:border-blue-300 dark:border-blue-900/40 dark:bg-slate-900 dark:text-slate-400"
          }`}
        >
          <span className="truncate text-right">{summary}</span>
          {active && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-extrabold text-white">
              {selected.length}
            </span>
          )}
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5 shrink-0 text-blue-500"
          >
            <path
              fillRule="evenodd"
              d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-64 p-0"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-slate-800">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
            {placeholder}
          </span>
          {active && (
            <button
              type="button"
              onClick={clear}
              className="text-[11px] font-bold text-rose-600 transition-colors hover:text-rose-700"
            >
              נקה
            </button>
          )}
        </div>
        <ul className="max-h-64 overflow-y-auto py-1">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-right text-sm font-semibold transition-colors ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                    }`}
                  >
                    {isSelected && <FaCheck size={9} />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

const summarise = (
  selected: string[],
  options: Option[],
  placeholder: string
): string => {
  if (selected.length === 0) return placeholder;
  if (selected.length === 1) {
    return options.find((o) => o.value === selected[0])?.label ?? placeholder;
  }
  return `${placeholder} · ${selected.length} נבחרו`;
};

export default DietPlanV2TemplateFilterMultiSelect;
