import { FaPlus, FaTrashCan } from "react-icons/fa6";

import type { DietV2FreeCalories } from "@/interfaces/IDietPlanV2";

import CatalogQuickAdd from "./CatalogQuickAdd";
import OptionRow from "./OptionRow";
import { useUpdateDietV2CatalogItem } from "@/hooks/mutations/dietV2Catalog/useUpdateDietV2CatalogItem";
import { toast } from "sonner";

interface FreeCaloriesFieldsProps {
  value?: DietV2FreeCalories;
  onChange: (value?: DietV2FreeCalories) => void;
}

const FreeCaloriesFields: React.FC<FreeCaloriesFieldsProps> = ({ value, onChange }) => {
  const updateCatalogItem = useUpdateDietV2CatalogItem();
  if (!value) {
    return (
      <button
        type="button"
        onClick={() => onChange({ calories: 0, items: [] })}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 px-4 py-3 text-sm font-bold text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/10 dark:text-emerald-300"
      >
        <FaPlus size={11} />
        הוסף קלוריות חופשיות לארוחה
      </button>
    );
  }

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

  return (
    <section className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/15">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-200">
            קלוריות חופשיות
          </h4>
          <p className="text-[11px] text-emerald-700/60 dark:text-emerald-300/60">
            נשמרות ומוצגות בנפרד מסיכום הארוחה
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          aria-label="הסר קלוריות חופשיות"
          className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-700/50 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <FaTrashCan size={11} />
        </button>
      </header>

      <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)]">
        <label className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 dark:border-emerald-900/50 dark:bg-slate-900">
          <span className="flex flex-1 flex-col">
            <span className="text-[11px] font-bold text-emerald-700">כמות</span>
            <span className="text-[10px] text-slate-400">קק״ל</span>
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
            className="w-20 bg-transparent text-left text-lg font-extrabold text-emerald-800 outline-none dark:text-emerald-200"
          />
        </label>
        <div className="flex flex-col gap-2">
          <CatalogQuickAdd
            category="freeCalories"
            existingItems={value.items}
            onAdd={(item) => onChange({ ...value, items: [...value.items, item] })}
            placeholder="חפש או כתוב מאכל חופשי…"
          />
          {value.items.length > 0 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
          )}
        </div>
      </div>
    </section>
  );
};

export default FreeCaloriesFields;
