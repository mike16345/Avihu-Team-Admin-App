import { FaPuzzlePiece, FaTrashCan } from "react-icons/fa6";

import type { DietV2PlanItem } from "@/interfaces/IDietPlanV2";

import CatalogQuickAdd from "./CatalogQuickAdd";
import OptionRow from "./OptionRow";
import { useUpdateDietV2CatalogItem } from "@/hooks/mutations/dietV2Catalog/useUpdateDietV2CatalogItem";
import { toast } from "sonner";

interface AddOnsFieldsProps {
  value: DietV2PlanItem[];
  onChange: (value: DietV2PlanItem[]) => void;
}

const AddOnsFields = ({ value, onChange }: AddOnsFieldsProps) => {
  const updateCatalogItem = useUpdateDietV2CatalogItem();
  const renameItem = (index: number, name: string) => {
    const normalized = name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    if (
      value.some(
        (candidate, candidateIndex) =>
          candidateIndex !== index &&
          candidate.name.trim().replace(/\s+/g, " ").toLocaleLowerCase() === normalized
      )
    ) {
      toast.error("התוספת כבר קיימת בארוחה הזו");
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
    <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/30">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <FaPuzzlePiece size={12} />
          </span>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">תוספות</h4>
            <p className="text-[10px] text-slate-500">
              מוצגות אחרי הקטגוריות ואינן משפיעות על המאקרו
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={value.length === 0}
          onClick={() => onChange([])}
          aria-label="נקה תוספות"
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
        >
          <FaTrashCan size={11} />
        </button>
      </header>

      <CatalogQuickAdd
        category="addon"
        existingItems={value}
        onAdd={(item) => onChange([...value, item])}
        placeholder="חפש תוספת או כתוב חדשה…"
      />

      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {value.map((item, index) => (
            <OptionRow
              key={`${item.catalogItemId ?? item.name}-${index}`}
              item={item}
              onRename={(name) => renameItem(index, name)}
              onRemove={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AddOnsFields;
