import { FaChevronDown, FaChevronUp, FaCopy, FaGripVertical, FaRobot, FaTrashCan, FaUserPen, FaUtensils } from "react-icons/fa6";

import type {
  DietV2Category,
  DietV2CategoryKind,
  DietV2Meal,
  DietV2MealMacroMode,
  DietV2OptionMacros,
} from "@/interfaces/IDietPlanV2";

import { computeMealAverage, deriveMealManualMacros } from "./dietPlanV2Utils";
import CategorySection from "./CategorySection";
import type { MealSibling } from "./CategorySection";
export type { MealSibling };

interface MealCardProps {
  meal: DietV2Meal;
  index: number;
  collapsed: boolean;
  siblingMeals: MealSibling[];
  onCopyCategoryToMeal: (kind: DietV2CategoryKind, targetMealId: string) => void;
  onCopyCategoryToNewMeal: (kind: DietV2CategoryKind) => void;
  onChange: (meal: DietV2Meal) => void;
  onToggleCollapse: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
}

const MealCard: React.FC<MealCardProps> = ({
  meal,
  index,
  collapsed,
  siblingMeals,
  onCopyCategoryToMeal,
  onCopyCategoryToNewMeal,
  onChange,
  onToggleCollapse,
  onDuplicate,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDropTarget,
}) => {
  const macroMode: DietV2MealMacroMode = meal.macroMode ?? "manual";
  const autoMacros: DietV2OptionMacros = {
    protein: computeMealAverage(meal, "protein"),
    carbs: computeMealAverage(meal, "carbs"),
    fat: computeMealAverage(meal, "fat"),
    calories: computeMealAverage(meal, "calories"),
  };
  const manualMacros: DietV2OptionMacros = deriveMealManualMacros(meal);
  const hasCategoryManualEntries = meal.categories.some(
    (cat) => cat.manualPrimaryGrams != null || cat.manualCalories != null
  );
  const displayedMacros = macroMode === "manual" ? manualMacros : autoMacros;

  const totalOptions = meal.categories.reduce((acc, c) => acc + c.options.length, 0);

  const onNameChange = (name: string) => {
    onChange({ ...meal, name });
  };

  const onCategoryChange = (categoryIndex: number, next: DietV2Category) => {
    const categories = meal.categories.map((cat, idx) => (idx === categoryIndex ? next : cat));
    onChange({ ...meal, categories });
  };

  const onToggleMacroMode = () => {
    const nextMode: DietV2MealMacroMode = macroMode === "auto" ? "manual" : "auto";
    const seededManual = nextMode === "manual" && !meal.manualMacros ? autoMacros : meal.manualMacros;
    onChange({ ...meal, macroMode: nextMode, manualMacros: seededManual });
  };

  const onManualMacroChange = (key: keyof DietV2OptionMacros, raw: string) => {
    const value = Math.max(0, Number(raw) || 0);
    const next = { ...manualMacros, [key]: value };
    onChange({ ...meal, manualMacros: next });
  };

  return (
    <article
      dir="rtl"
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm shadow-blue-500/5 transition-all dark:bg-slate-900 ${
        isDragging
          ? "border-blue-400 opacity-50"
          : isDropTarget
            ? "border-blue-400 ring-2 ring-blue-300/60"
            : "border-blue-100 dark:border-blue-900/40"
      }`}
    >
      {/* Header — single dense row: name on the right, macro
          summary inline in the middle, AI toggle + actions left.
          Macros sit IN the header (not a separate band) for the
          tightest visual rhythm. Wraps on narrow widths.
          Clicking anywhere on the header toggles collapse — nested
          inputs/buttons stop propagation so they still act on their
          own click without triggering a toggle. */}
      <header
        onClick={onToggleCollapse}
        className="flex cursor-pointer flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-l from-blue-50/60 to-white px-4 py-3 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-slate-900"
      >
        <div className="flex items-center gap-2.5">
          {/* Drag handle — entire card is draggable when grabbing
              the handle; setting draggable on the handle alone keeps
              text selection inside inputs/textareas working. */}
          <span
            draggable
            onDragStart={onDragStart}
            onClick={(e) => e.stopPropagation()}
            title="גרור לסידור הארוחות"
            className="flex h-9 w-5 cursor-grab items-center justify-center text-slate-300 transition-colors hover:text-blue-500 active:cursor-grabbing"
          >
            <FaGripVertical size={11} />
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-md shadow-blue-500/25">
            <FaUtensils size={13} />
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <input
              value={meal.name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full bg-transparent text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
              placeholder={`ארוחה ${index}`}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {totalOptions} אפשרויות · 4 קטגוריות
            </p>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <MealMacroInline
            mode={macroMode}
            displayed={displayedMacros}
            onManualChange={onManualMacroChange}
            hasOptions={totalOptions > 0}
            readOnly={macroMode === "manual" && hasCategoryManualEntries}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            aria-label={collapsed ? "פתח ארוחה" : "סגור ארוחה"}
            title={collapsed ? "פתח ארוחה" : "סגור ארוחה"}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-600 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/40 dark:bg-slate-900 dark:text-blue-300"
          >
            {collapsed ? <FaChevronDown size={11} /> : <FaChevronUp size={11} />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMacroMode();
            }}
            title={
              macroMode === "auto"
                ? "כיבוי AI — אחליף לערכים ידניים"
                : "הפעלת AI — חישוב אוטומטי מהאפשרויות"
            }
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all hover:-translate-y-0.5 ${
              macroMode === "auto"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300"
            }`}
          >
            {macroMode === "auto" ? <FaRobot size={10} /> : <FaUserPen size={10} />}
            {macroMode === "auto" ? "AI פעיל" : "ידני"}
          </button>
          <button
            type="button"
            aria-label="שכפל ארוחה"
            title="שכפל ארוחה"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-white text-blue-600 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/40 dark:bg-slate-900 dark:text-blue-300"
          >
            <FaCopy size={11} />
          </button>
          <button
            type="button"
            aria-label="הסר ארוחה"
            title="הסר ארוחה"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-white text-rose-600 transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-900/40 dark:bg-slate-900 dark:text-rose-300"
          >
            <FaTrashCan size={11} />
          </button>
        </div>
      </header>

      {/* Categories — hidden when the meal is collapsed to save
          vertical space; header alone keeps the macro summary and
          all the meal-level controls visible. */}
      {!collapsed && (
        <div className="flex flex-col gap-3 p-4">
          {meal.categories.map((category, idx) => (
            <CategorySection
              key={category.kind}
              category={category}
              macroMode={macroMode}
              siblingMeals={siblingMeals}
              onCopyToMeal={(targetId) => onCopyCategoryToMeal(category.kind, targetId)}
              onCopyToNewMeal={() => onCopyCategoryToNewMeal(category.kind)}
              onChange={(next) => onCategoryChange(idx, next)}
            />
          ))}
        </div>
      )}
    </article>
  );
};

interface MealMacroInlineProps {
  mode: DietV2MealMacroMode;
  displayed: DietV2OptionMacros;
  onManualChange: (key: keyof DietV2OptionMacros, raw: string) => void;
  hasOptions: boolean;
  readOnly?: boolean;
}

const MealMacroInline: React.FC<MealMacroInlineProps> = ({
  mode,
  displayed,
  onManualChange,
  hasOptions,
  readOnly,
}) => {
  const items: { key: keyof DietV2OptionMacros; label: string; unit: string }[] = [
    { key: "protein", label: "חלבון", unit: "גרם" },
    { key: "carbs", label: "פחמימה", unit: "גרם" },
    { key: "fat", label: "שומן", unit: "גרם" },
    { key: "calories", label: "קלוריות", unit: "קל׳" },
  ];

  if (!hasOptions && mode === "auto") {
    return (
      <span className="text-[11px] italic text-slate-400 dark:text-slate-500">
        הוסף אפשרויות לחישוב מאקרו
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
      {items.map((item, idx) => (
        <span key={item.key} className="inline-flex items-baseline gap-1 whitespace-nowrap">
          {idx > 0 && (
            <span className="me-1.5 text-slate-200 dark:text-slate-700" aria-hidden>
              |
            </span>
          )}
          <span className="font-medium text-slate-400 dark:text-slate-500">{item.label}</span>
          <span className="text-slate-300 dark:text-slate-600">-</span>
          {mode === "manual" && !readOnly ? (
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={displayed[item.key] || ""}
              onChange={(e) => onManualChange(item.key, e.target.value)}
              className={`h-5 w-11 rounded border border-slate-200 bg-white px-1 text-center text-[11px] font-semibold focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-200/60 dark:border-slate-700 dark:bg-slate-900 ${
                item.key === "calories" ? "text-rose-500 dark:text-rose-400" : "text-slate-600 dark:text-slate-300"
              }`}
            />
          ) : (
            <span
              className={`text-[11px] font-semibold ${
                item.key === "calories" ? "text-rose-500 dark:text-rose-400" : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {Math.round(displayed[item.key])}
            </span>
          )}
          <span className="text-[10px] text-slate-300 dark:text-slate-600">{item.unit}</span>
        </span>
      ))}
    </div>
  );
};

export default MealCard;
