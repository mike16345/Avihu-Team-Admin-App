import { FaPuzzlePiece, FaTrashCan } from "react-icons/fa6";

import type { DietV2PlanItem } from "@/interfaces/IDietPlanV2";

import CatalogQuickAdd from "./CatalogQuickAdd";
import OptionRow from "./OptionRow";

interface AddOnsFieldsProps {
  value: DietV2PlanItem[];
  onChange: (value: DietV2PlanItem[]) => void;
}

const AddOnsFields = ({ value, onChange }: AddOnsFieldsProps) => (
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
            onRemove={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
          />
        ))}
      </div>
    )}
  </section>
);

export default AddOnsFields;
