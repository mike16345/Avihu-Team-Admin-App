import { useState } from "react";
import { FaTrashCan } from "react-icons/fa6";

import type { DietV2FreeCalories } from "@/interfaces/IDietPlanV2";

import CatalogQuickAdd from "./CatalogQuickAdd";
import OptionRow from "./OptionRow";
import { useUpdateDietV2CatalogItem } from "@/hooks/mutations/dietV2Catalog/useUpdateDietV2CatalogItem";
import { toast } from "sonner";

interface FreeCaloriesFieldsProps {
  value?: DietV2FreeCalories;
  onChange: (value?: DietV2FreeCalories) => void;
  onRemove?: () => void;
}

const FreeCaloriesFields: React.FC<FreeCaloriesFieldsProps> = ({ value, onChange, onRemove }) => {
  const [collapsed, setCollapsed] = useState(false);
  const updateCatalogItem = useUpdateDietV2CatalogItem();
  if (!value) return null;

  const renameItem = (index: number, name: string) => {
    const normalized = name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    if (
      value.items.some(
        (candidate, candidateIndex) =>
          candidateIndex !== index &&
          candidate.name.trim().replace(/\s+/g, " ").toLocaleLowerCase() === normalized
      )
    ) {
      toast.error("המאכל כבר קיים בקלוריות החופשיות");
      return;
    }
    const apply = () =>
      onChange({
        ...value,
        items: value.items.map((candidate, candidateIndex) =>
          candidateIndex === index ? { ...candidate, name } : candidate
        ),
      });
    const item = value.items[index];
    if (item.catalogItemId) {
      updateCatalogItem.mutate({ id: item.catalogItemId, name }, { onSuccess: apply });
    } else apply();
  };

  const preview = value.items.map((item) => item.name).join(" / ");

  return (
    <section
      dir="rtl"
      className="group rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 px-3 py-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/15"
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "פתח קלוריות חופשיות" : "קפל קלוריות חופשיות"}
          className="flex h-10 w-8 shrink-0 items-center justify-center rounded-md text-emerald-700 transition-colors hover:bg-emerald-100/60 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-5 w-5 transition-transform ${collapsed ? "" : "rotate-180"}`}
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <CatalogQuickAdd
                category="freeCalories"
                categoryLabel="קלוריות חופשיות"
                existingItems={value.items}
                onAdd={(item) => onChange({ ...value, items: [...value.items, item] })}
                placeholder="חפש או כתוב מאכל חופשי…"
              />
            </div>
            <label className="flex h-12 shrink-0 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-2.5 shadow-sm md:w-40 dark:border-emerald-900/50 dark:bg-slate-900">
              <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
                <span className="truncate text-[11px] font-bold text-emerald-700">כמות</span>
                <span className="shrink-0 text-[9px] text-slate-400">קק״ל</span>
              </span>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                aria-label="קלוריות חופשיות"
                value={value.calories}
                onChange={(event) =>
                  onChange({ ...value, calories: Math.max(0, Number(event.target.value) || 0) })
                }
                className="w-16 min-w-0 bg-transparent text-start text-sm font-extrabold text-emerald-800 outline-none [appearance:textfield] dark:text-emerald-200 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </label>
          </>
        )}

        {collapsed && (
          <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
            <h4 className="truncate text-sm font-extrabold text-emerald-800 dark:text-emerald-200">
              קלוריות חופשיות — ({value.calories})
            </h4>
          </div>
        )}

        <div
          className={`mr-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 ${collapsed ? "flex-row" : "flex-col"}`}
        >
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              onRemove?.();
            }}
            aria-label="הסר קלוריות חופשיות"
            title="הסר קלוריות חופשיות"
            className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-700/50 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <FaTrashCan size={11} />
          </button>
        </div>
      </div>

      {!collapsed && value.items.length > 0 && (
        <div className="mt-7 flex flex-col gap-4 pb-3 pl-2 pr-12">
          <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400">
            אופציות של קלוריות חופשיות:
          </h5>
          <div className="flex flex-wrap gap-3">
            {value.items.map((item, index) => (
              <OptionRow
                key={`${item.catalogItemId ?? item.name}-${index}`}
                item={item}
                onRename={(name) => renameItem(index, name)}
                onRemove={() =>
                  onChange({
                    ...value,
                    items: value.items.filter((_, itemIndex) => itemIndex !== index),
                  })
                }
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default FreeCaloriesFields;
