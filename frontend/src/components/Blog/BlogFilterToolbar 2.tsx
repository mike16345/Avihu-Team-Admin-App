import { FaMagnifyingGlass, FaXmark } from "react-icons/fa6";

type BlogFilterToolbarProps = {
  filteredCount: number;
  totalCount: number;
  hasFilter: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onClearFilters: () => void;
};

const getBlogCountLabel = (hasFilter: boolean, filteredCount: number, totalCount: number) => {
  if (hasFilter && filteredCount !== totalCount) return `מתוך ${totalCount} מאמרים`;
  return "מאמרים בסך הכל";
};

const BlogFilterToolbar: React.FC<BlogFilterToolbarProps> = ({
  filteredCount,
  totalCount,
  hasFilter,
  query,
  onQueryChange,
  onClearFilters,
}) => (
  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center gap-2 px-2">
      <span className="inline-flex h-8 min-w-[2.5rem] items-center justify-center rounded-lg bg-slate-100 px-2 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        {filteredCount}
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {getBlogCountLabel(hasFilter, filteredCount, totalCount)}
      </span>
    </div>

    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

    <div className="relative min-w-[200px] flex-1">
      <FaMagnifyingGlass
        size={12}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
      />
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="חיפוש לפי כותרת, תת-כותרת או תוכן…"
        className="h-9 w-full rounded-xl border border-slate-200 bg-white pr-8 pl-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          className="absolute left-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800"
          aria-label="נקה חיפוש"
        >
          <FaXmark size={10} />
        </button>
      )}
    </div>

    {hasFilter && (
      <button
        type="button"
        onClick={onClearFilters}
        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        נקה הכל
      </button>
    )}
  </div>
);

export default BlogFilterToolbar;
