import { useState } from "react";
import { FaPuzzlePiece, FaTrashCan } from "react-icons/fa6";

import type { DietV2PlanItem } from "@/interfaces/IDietPlanV2";

import CatalogQuickAdd from "./CatalogQuickAdd";
import OptionRow from "./OptionRow";
import { useUpdateDietV2CatalogItem } from "@/hooks/mutations/dietV2Catalog/useUpdateDietV2CatalogItem";
import { toast } from "sonner";

interface AddOnsFieldsProps {
  value: DietV2PlanItem[];
  onChange: (value: DietV2PlanItem[]) => void;
  onRemove?: () => void;
}

const ADDON_LABEL = "תוספים";

const AddOnsFields = ({ value, onChange, onRemove }: AddOnsFieldsProps) => {
  const [collapsed, setCollapsed] = useState(true);
  const updateCatalogItem = useUpdateDietV2CatalogItem();
  const hasItems = value.length > 0;
  const preview = value.map((item) => item.name).join(" / ");

  const renameItem = (index: number, name: string) => {
    const normalized = name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    if (
      value.some(
        (candidate, candidateIndex) =>
          candidateIndex !== index &&
          candidate.name.trim().replace(/\s+/g, " ").toLocaleLowerCase() === normalized
      )
    ) {
      toast.error("התוסף כבר קיים בארוחה הזו");
      return;
    }
    const apply = () =>
      onChange(
        value.map((candidate, candidateIndex) =>
          candidateIndex === index ? { ...candidate, name } : candidate
        )
      );
    const item = value[index];
    if (item.catalogItemId) {
      updateCatalogItem.mutate({ id: item.catalogItemId, name }, { onSuccess: apply });
    } else apply();
  };

  return (
    <section
      dir="rtl"
      className="group rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm shadow-slate-500/5 dark:border-slate-800 dark:bg-slate-900/60"
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "פתח תוספים" : "קפל תוספים"}
          className="flex h-10 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
          <div className="min-w-0 flex-1">
            <CatalogQuickAdd
              category="addon"
              categoryLabel={ADDON_LABEL}
              existingItems={value}
              onAdd={(item) => onChange([...value, item])}
              placeholder="חפש תוסף או כתוב חדש…"
            />
          </div>
        )}

        {collapsed && (
          <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <FaPuzzlePiece size={12} />
            </span>
            <h4 className="truncate text-sm font-extrabold text-slate-800 dark:text-slate-100">
              {ADDON_LABEL}
            </h4>
          </div>
        )}

        <div
          className={`mr-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 ${collapsed ? "flex-row" : "flex-col"}`}
        >
          <button
            type="button"
            onClick={() => {
              onChange([]);
              onRemove?.();
            }}
            aria-label="הסר תוספים"
            title="הסר תוספים"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <FaTrashCan size={11} />
          </button>
        </div>
      </div>

      {!collapsed && hasItems && (
        <div className="mt-7 flex flex-col gap-4 pb-3 pl-2 pr-12">
          <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400">
            אופציות של {ADDON_LABEL}:
          </h5>
          <div className="flex flex-wrap gap-3">
            {value.map((item, index) => (
              <OptionRow
                key={`${item.catalogItemId ?? item.name}-${index}`}
                item={item}
                onRename={(name) => renameItem(index, name)}
                onRemove={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default AddOnsFields;
