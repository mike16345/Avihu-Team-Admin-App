import { useState } from "react";
import { FaFolderOpen, FaPlus } from "react-icons/fa6";

import type {
  DietV2Category,
  DietV2CategoryKind,
  DietV2MealMacroMode,
  DietV2Option,
} from "@/interfaces/IDietPlanV2";

import {
  CATEGORY_LABELS,
  CATEGORY_TONES,
  computeCategoryAverage,
  computeMacrosFromFood,
  estimateMacrosForUnknown,
  makeLocalId,
  parseQuickAddText,
  primaryMacroForCategory,
  type FoodLibraryItem,
} from "./dietPlanV2Utils";
import FoodPicker from "./FoodPicker";
import OptionRow from "./OptionRow";

interface CategorySectionProps {
  category: DietV2Category;
  onChange: (category: DietV2Category) => void;
  /** Parent meal's macro mode. When "manual" the category header
   *  swaps its computed-average badges for editable inputs so the
   *  trainer can type per-category values without relying on the
   *  AI / library lookup. Defaults to "auto". */
  macroMode?: DietV2MealMacroMode;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, onChange, macroMode = "auto" }) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const tone = CATEGORY_TONES[category.kind];

  const primaryMacro = primaryMacroForCategory(category.kind);
  const primaryAvg = primaryMacro ? computeCategoryAverage(category, primaryMacro) : 0;
  const calAvg = computeCategoryAverage(category, "calories");
  const hasOptions = category.options.length > 0;
  const estimatedCount = category.options.filter((opt) => opt.estimated).length;
  const reliableCount = category.options.length - estimatedCount;

  const onFoodSelected = (food: FoodLibraryItem) => {
    const quantity =
      food.defaultQuantity ?? (food.defaultUnit === "g" ? 100 : 1);
    const newOption: DietV2Option = {
      id: makeLocalId("option"),
      foodName: food.name,
      quantity,
      unit: food.defaultUnit,
      macros: computeMacrosFromFood(food, quantity),
    };
    onChange({ ...category, options: [...category.options, newOption] });
    setPickerOpen(false);
  };

  const onOptionChange = (index: number, next: DietV2Option) => {
    const options = category.options.map((option, idx) => (idx === index ? next : option));
    onChange({ ...category, options });
  };

  const onOptionRemove = (index: number) => {
    const options = category.options.filter((_, idx) => idx !== index);
    onChange({ ...category, options });
  };

  /**
   * Quick-add submit: parses free-text "300 גרם אורז" → option and
   * appends it. When the parser matches a food in the library the
   * macros come from the library; when nothing matches the trainer
   * still gets a row with their typed quantity/unit and macros at
   * zero — they can fill macros manually or remove and try again.
   */
  const submitQuickAdd = (raw: string): boolean => {
    const parsed = parseQuickAddText(raw, category.kind);
    if (!parsed) return false;

    // Library match → exact macros. No match → category-level
    // estimate so the row still carries useful numbers, flagged
    // with `estimated:true` so the UI marks it for the trainer.
    const macros = parsed.matchedFood
      ? computeMacrosFromFood(parsed.matchedFood, parsed.quantity, parsed.unit)
      : estimateMacrosForUnknown(parsed.quantity, parsed.unit, category.kind);

    const newOption: DietV2Option = {
      id: makeLocalId("option"),
      foodName: parsed.foodName,
      quantity: parsed.quantity,
      unit: parsed.unit,
      macros,
      estimated: !parsed.matchedFood,
    };
    onChange({ ...category, options: [...category.options, newOption] });
    return true;
  };

  const [adding, setAdding] = useState(false);
  const isCompactEmpty = !hasOptions && !adding && macroMode !== "manual";

  // Compact empty state — a single inline button instead of a full
  // header + empty input box. Click expands to the real editor.
  if (isCompactEmpty) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        dir="rtl"
        className={`group flex w-full items-center justify-between rounded-xl border border-dashed ${tone.ring} bg-white px-3 py-2 text-right transition-all hover:border-solid hover:bg-blue-50/40 dark:bg-slate-900 dark:hover:bg-blue-950/30`}
      >
        <span className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md ${tone.chip} px-2 py-0.5 text-xs font-bold ${tone.chipText}`}
          >
            {CATEGORY_LABELS[category.kind]}
          </span>
          <span className="text-[11px] text-slate-400 transition-colors group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300">
            הוסף אפשרות להחלפה
          </span>
        </span>
        <FaPlus size={9} className="text-slate-400 group-hover:text-blue-600" />
      </button>
    );
  }

  return (
    <section
      dir="rtl"
      className={`rounded-xl border ${tone.ring} bg-white px-3 py-3 dark:bg-slate-900`}
    >
      <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md ${tone.chip} px-2 py-0.5 text-xs font-bold ${tone.chipText}`}
          >
            {CATEGORY_LABELS[category.kind]}
          </span>
          {hasOptions && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {category.options.length} אפשרויות להחלפה
            </span>
          )}
        </div>
        {macroMode === "manual" ? (
          <CategoryManualInputs
            primaryMacro={primaryMacro}
            primaryGrams={category.manualPrimaryGrams ?? Math.round(primaryAvg)}
            calories={category.manualCalories ?? Math.round(calAvg)}
            onChange={(field, value) =>
              onChange({
                ...category,
                ...(field === "primary"
                  ? { manualPrimaryGrams: value }
                  : { manualCalories: value }),
              })
            }
          />
        ) : (
          <CategoryAverageBadges
            primaryMacro={primaryMacro}
            primaryAvg={primaryAvg}
            calAvg={calAvg}
            hasOptions={hasOptions}
            reliableCount={reliableCount}
            estimatedCount={estimatedCount}
          />
        )}
      </header>

      <div className="flex flex-col gap-2">
        <QuickAddInput
          categoryKind={category.kind}
          onQuickAdd={submitQuickAdd}
          onOpenPicker={() => setPickerOpen(true)}
        />
        {hasOptions && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {category.options.map((option, index) => (
              <OptionRow
                key={option.id}
                option={option}
                categoryKind={category.kind}
                macroMode={macroMode}
                onChange={(next) => onOptionChange(index, next)}
                onRemove={() => onOptionRemove(index)}
              />
            ))}
          </div>
        )}
      </div>

      <FoodPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        kind={category.kind}
        onSelect={onFoodSelected}
      />
    </section>
  );
};

interface CategoryAverageBadgesProps {
  primaryMacro: ReturnType<typeof primaryMacroForCategory>;
  primaryAvg: number;
  calAvg: number;
  hasOptions: boolean;
  reliableCount: number;
  estimatedCount: number;
}

const MACRO_LABEL_HE: Record<string, string> = {
  protein: "חלבון",
  carbs: "פחמ׳",
  fat: "שומן",
};

/**
 * Single-value summary per category — one figure for the primary
 * macro plus a calorie average. Estimated options are excluded
 * from the average; we surface the count of excluded rows so the
 * trainer understands why a row they added didn't move the number.
 */
const CategoryAverageBadges: React.FC<CategoryAverageBadgesProps> = ({
  primaryMacro,
  primaryAvg,
  calAvg,
  hasOptions,
  reliableCount,
  estimatedCount,
}) => {
  if (!hasOptions) {
    return (
      <span className="text-[10px] italic text-slate-400 dark:text-slate-500">
        הוסף אפשרות להחלפה כדי לראות ממוצע
      </span>
    );
  }

  if (reliableCount === 0) {
    return (
      <span
        className="text-[10px] italic text-amber-600 dark:text-amber-300"
        title="כל האפשרויות להחלפה בקטגוריה מסומנות כמוערכות ולא נכללות בממוצע"
      >
        כל האפשרויות להחלפה מוערכות — לא נכלל בממוצע
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
      {primaryMacro && (
        <span className="inline-flex items-baseline gap-1 rounded-md bg-blue-100 px-2 py-0.5 font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
          <span>{MACRO_LABEL_HE[primaryMacro]}</span>
          <strong className="text-[12px]">{primaryAvg}</strong>
          <span className="text-[10px]">ג׳</span>
        </span>
      )}
      <span className="inline-flex items-baseline gap-1 rounded-md bg-rose-50 px-2 py-0.5 font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
        <span>≈</span>
        <strong className="text-[12px]">{Math.round(calAvg)}</strong>
        <span className="text-[10px]">קל׳</span>
      </span>
      {estimatedCount > 0 && (
        <span
          className="text-[10px] italic text-amber-600 dark:text-amber-300"
          title="אפשרויות להחלפה מוערכות לא נכללות בממוצע"
        >
          ({estimatedCount} לא נכללות)
        </span>
      )}
    </div>
  );
};

/**
 * Manual mode for a category header — the trainer types the primary
 * macro grams (protein/carbs/fat depending on category) and the
 * calories directly. The values are saved on the category and shown
 * here regardless of which options are attached below; the options
 * exist purely as suggestions for the trainee.
 */
interface CategoryManualInputsProps {
  primaryMacro: ReturnType<typeof primaryMacroForCategory>;
  primaryGrams: number;
  calories: number;
  onChange: (field: "primary" | "calories", value: number) => void;
}

const CategoryManualInputs: React.FC<CategoryManualInputsProps> = ({
  primaryMacro,
  primaryGrams,
  calories,
  onChange,
}) => (
  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
    {primaryMacro && (
      <span className="inline-flex items-baseline gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
        <span className="text-[10px]">{MACRO_LABEL_HE[primaryMacro]}</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={primaryGrams || ""}
          onChange={(e) => onChange("primary", Math.max(0, Number(e.target.value) || 0))}
          className="h-5 w-12 rounded border border-current/30 bg-white/70 px-1 text-center text-xs font-extrabold focus:bg-white focus:outline-none focus:ring-1 focus:ring-current/40 dark:bg-slate-900/60"
        />
        <span className="text-[10px]">ג׳</span>
      </span>
    )}
    <span className="inline-flex items-baseline gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 font-bold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
      <span className="text-[10px]">קל׳</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={calories || ""}
        onChange={(e) => onChange("calories", Math.max(0, Number(e.target.value) || 0))}
        className="h-5 w-14 rounded border border-current/30 bg-white/70 px-1 text-center text-xs font-extrabold focus:bg-white focus:outline-none focus:ring-1 focus:ring-current/40 dark:bg-slate-900/60"
      />
    </span>
  </div>
);

export default CategorySection;

/**
 * Keyboard-first food entry. Trainer types "300 גרם אורז" or
 * "6 כפות אורז" and hits Enter — the row appears instantly under
 * the right category. The folder icon opens the full picker for
 * cases where the trainer prefers to browse.
 */
function QuickAddInput({
  categoryKind,
  onQuickAdd,
  onOpenPicker,
}: {
  categoryKind: DietV2CategoryKind;
  onQuickAdd: (raw: string) => boolean;
  onOpenPicker: () => void;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const tryAdd = () => {
    if (!value.trim()) return;
    const ok = onQuickAdd(value);
    if (ok) {
      setValue("");
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/40 px-2 py-1 transition-colors focus-within:border-blue-500 focus-within:bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          <FaPlus size={9} />
        </span>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              tryAdd();
            }
          }}
          placeholder={`לדוגמה: 300 גרם ${CATEGORY_LABELS[categoryKind]}…`}
          className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
        />
        <button
          type="button"
          onClick={onOpenPicker}
          title="פתח רשימת מאכלים"
          className="flex h-7 w-7 items-center justify-center rounded-md text-blue-600 transition-colors hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/40"
        >
          <FaFolderOpen size={11} />
        </button>
        <button
          type="button"
          onClick={tryAdd}
          disabled={!value.trim()}
          className="rounded-md brand-gradient brand-gradient-hover px-3 py-1 text-[11px] font-bold text-white shadow-sm shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          הוסף
        </button>
      </div>
      {error && (
        <span className="px-2 text-[10px] font-bold text-rose-600 dark:text-rose-400">
          לא הצלחתי לפענח — נסה "כמות + יחידה + שם" (לדוגמה "300 גרם אורז")
        </span>
      )}
    </div>
  );
}
