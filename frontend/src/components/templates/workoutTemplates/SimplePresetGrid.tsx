import React, { ReactNode, useMemo, useState } from "react";
import {
  FaMagnifyingGlass,
  FaPenToSquare,
  FaTrash,
  FaSliders,
  FaPersonRunning,
} from "react-icons/fa6";

interface SimpleItem {
  _id?: string;
  name?: string;
  title?: string;
}

interface SimplePresetGridProps {
  data: SimpleItem[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  actionButton?: ReactNode;
  variant?: "method" | "cardio";
  searchPlaceholder?: string;
  emptyLabel?: string;
}

const VARIANT_META = {
  method: {
    icon: <FaSliders size={13} />,
    iconBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-blue-200/60",
  },
  cardio: {
    icon: <FaPersonRunning size={13} />,
    iconBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 ring-rose-200/60",
  },
};

const getSimpleItemName = (item: SimpleItem) => item.name || item.title || "";

const getItemCountLabel = (count: number) => {
  if (count === 1) return "פריט";
  return "פריטים";
};

const SimplePresetGrid: React.FC<SimplePresetGridProps> = ({
  data,
  onView,
  onDelete,
  actionButton,
  variant = "method",
  searchPlaceholder = "חיפוש…",
  emptyLabel = "לא נמצאו פריטים",
}) => {
  const [search, setSearch] = useState("");
  const meta = VARIANT_META[variant];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) => getSimpleItemName(item).toLowerCase().includes(q));
  }, [data, search]);
  const hasNoResults = filtered.length === 0;
  const itemCountLabel = getItemCountLabel(filtered.length);

  return (
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1 max-w-[360px]">
          <FaMagnifyingGlass
            size={11}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pr-8 pl-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {filtered.length} {itemCountLabel}
          {filtered.length !== data.length && ` מתוך ${data.length}`}
        </span>
        <div className="ms-auto">{actionButton}</div>
      </div>

      {hasNoResults && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 shadow-sm">
            {meta.icon}
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">{emptyLabel}</p>
        </div>
      )}
      {!hasNoResults && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <article
              key={item._id}
              onClick={() => item._id && onView(item._id)}
              className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors ${meta.iconBg} group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600`}
              >
                {meta.icon}
              </div>

              <h3 className="flex-1 min-w-0 truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                {getSimpleItemName(item)}
              </h3>

              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item._id) onView(item._id);
                  }}
                  aria-label="עריכה"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40"
                >
                  <FaPenToSquare size={10} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item._id && confirm(`למחוק את "${getSimpleItemName(item)}"?`))
                      onDelete(item._id);
                  }}
                  aria-label="מחיקה"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimplePresetGrid;
