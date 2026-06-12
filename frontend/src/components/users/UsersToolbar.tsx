import { FaMagnifyingGlass } from "react-icons/fa6";
import { STATUS_FILTERS } from "./usersPageConstants";
import type { StatusFilter } from "./usersPageTypes";

type UsersToolbarProps = {
  search: string;
  statusFilter: StatusFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
};

const getFilterButtonClassName = (isSelected: boolean) => {
  const baseClassName = "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all";

  if (isSelected) {
    return `${baseClassName} bg-blue-600 text-white shadow-sm`;
  }

  return `${baseClassName} text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800`;
};

const UsersToolbar = ({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: UsersToolbarProps) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <FaMagnifyingGlass
          size={12}
          className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="חיפוש לפי שם / סוג תוכנית / אימייל / טלפון"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 ps-10 pe-4 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => onStatusFilterChange(filter)}
            className={getFilterButtonClassName(statusFilter === filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UsersToolbar;
