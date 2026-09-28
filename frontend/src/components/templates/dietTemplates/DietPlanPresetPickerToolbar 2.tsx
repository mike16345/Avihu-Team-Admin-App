import { FaMagnifyingGlass, FaSliders } from "react-icons/fa6";

type DietPlanPresetPickerToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  activeChipCount: number;
};

const DietPlanPresetPickerToolbar = ({
  search,
  onSearchChange,
  filteredCount,
  totalCount,
  filtersOpen,
  onToggleFilters,
  activeChipCount,
}: DietPlanPresetPickerToolbarProps) => (
  <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
    <div className="relative min-w-[200px] max-w-[420px] flex-1">
      <FaMagnifyingGlass
        size={11}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
      />
      <input
        type="text"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="חיפוש לפי שם תפריט…"
        autoFocus
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pr-8 pl-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-900"
      />
    </div>

    <span className="text-xs text-slate-500 dark:text-slate-400">
      {filteredCount} מתוך {totalCount}
    </span>

    <button
      type="button"
      onClick={onToggleFilters}
      aria-expanded={filtersOpen}
      className="ms-auto inline-flex h-9 items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-3.5 text-sm font-bold text-blue-700 transition-all hover:border-blue-400 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/40"
    >
      <FaSliders size={12} />
      סינון
      {activeChipCount > 0 && (
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
          {activeChipCount}
        </span>
      )}
    </button>
  </div>
);

export default DietPlanPresetPickerToolbar;
