/**
 * FilterMultiSelect — compact filter dropdown for table headers.
 *
 * Visual refresh: pill-style trigger that matches the rest of the
 * redesigned admin panel (Heebo, rounded-xl, slate borders, blue active
 * state, chevron + clear button). Replaces the bulky default outline
 * button.
 */
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Option } from "@/types/types";
import { FaChevronDown, FaXmark, FaFilter } from "react-icons/fa6";

interface FilterMultiSelectProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

const FilterMultiSelect = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "הכל",
  className,
}: FilterMultiSelectProps) => {
  const optionMap = useMemo(
    () =>
      options.reduce<Record<string, string>>((acc, option) => {
        acc[option.value] = option.name;
        return acc;
      }, {}),
    [options]
  );

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  };

  const active = selected.length > 0;
  /**
   * Summary mirrors the original behaviour the rest of the app expects:
   *   none      → placeholder
   *   1 picked  → "<name>"
   *   many      → "<first name> ועוד N"
   * Some surfaces (e.g. ExerciseProgressNotePanel) rely on the summary
   * to show *which* item is picked at a glance, not just the count.
   */
  const summary = useMemo(() => {
    if (!selected.length) return placeholder;
    if (selected.length === 1) return optionMap[selected[0]] ?? selected[0];
    const firstLabel = optionMap[selected[0]] ?? selected[0];
    const restCount = selected.length - 1;
    return `${firstLabel} ועוד ${restCount}`;
  }, [selected, optionMap, placeholder]);

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          dir="rtl"
          style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
          className={cn(
            "group inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-all",
            active
              ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800",
            className
          )}
        >
          <FaFilter size={10} className="shrink-0 opacity-60" />
          <span className="shrink-0">{label}:</span>
          <span className="max-w-[12rem] truncate font-normal">{summary}</span>
          {active ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange([]);
                }
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 transition-colors hover:bg-blue-200 dark:hover:bg-blue-900"
              aria-label="נקה סינון"
            >
              <FaXmark size={9} />
            </span>
          ) : (
            <FaChevronDown
              size={10}
              className="text-slate-400 dark:text-slate-500 transition-transform group-data-[state=open]:rotate-180"
            />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="max-h-64 w-72 overflow-y-auto rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-lg"
        style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
      >
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            dir="rtl"
            checked={selected.includes(option.value)}
            onCheckedChange={() => handleToggle(option.value)}
            onSelect={(event) => event.preventDefault()}
            className="rounded-lg text-sm"
          >
            {option.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterMultiSelect;
