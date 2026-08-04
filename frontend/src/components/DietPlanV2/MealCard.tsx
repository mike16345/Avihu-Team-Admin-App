import {
  FaChevronDown,
  FaChevronUp,
  FaCopy,
  FaGripVertical,
  FaTrashCan,
  FaUtensils,
} from "react-icons/fa6";

import type {
  DietV2Category,
  DietV2CategoryKind,
  DietV2Meal,
  DietV2OptionMacros,
} from "@/interfaces/IDietPlanV2";

import CategorySection from "./CategorySection";
import type { MealSibling } from "./CategorySection";
import { DIET_V2_DEFAULT_CATEGORIES, computeMealTotalsFromCategories } from "./dietPlanV2Utils";
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
  const displayedMacros: DietV2OptionMacros = computeMealTotalsFromCategories(meal.categories);

  const totalOptions = meal.categories.reduce((acc, c) => acc + c.options.length, 0);

  const displayedCategories: DietV2Category[] = DIET_V2_DEFAULT_CATEGORIES.map(
    (kind) =>
      meal.categories.find((c) => c.kind === kind) ?? {
        kind,
        options: [],
      }
  );

  const onNameChange = (name: string) => {
    onChange({ ...meal, name });
  };

  const onCategoryChangeByKind = (kind: DietV2CategoryKind, next: DietV2Category) => {
    const hasKind = meal.categories.some((c) => c.kind === kind);
    const categories = hasKind
      ? meal.categories.map((c) => (c.kind === kind ? next : c))
      : [...meal.categories, next];
    onChange({ ...meal, categories });
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
      <header
        onClick={onToggleCollapse}
        className="flex cursor-pointer flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-l from-blue-50/60 to-white px-4 py-3 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-slate-900"
      >
        <div className="flex items-center gap-2.5">
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
              {totalOptions} אפשרויות · {displayedCategories.length} קטגוריות
            </p>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <MealMacroInline displayed={displayedMacros} />
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

      {!collapsed && (
        <div className="flex flex-col gap-3 p-4">
          {displayedCategories.map((category) => (
            <CategorySection
              key={category.kind}
              category={category}
              siblingMeals={siblingMeals}
              onCopyToMeal={(targetId) => onCopyCategoryToMeal(category.kind, targetId)}
              onCopyToNewMeal={() => onCopyCategoryToNewMeal(category.kind)}
              onChange={(next) => onCategoryChangeByKind(category.kind, next)}
            />
          ))}
        </div>
      )}
    </article>
  );
};

interface MealMacroInlineProps {
  displayed: DietV2OptionMacros;
}

const MealMacroInline: React.FC<MealMacroInlineProps> = ({ displayed }) => {
  const items: { key: keyof DietV2OptionMacros; label: string; unit: string }[] = [
    { key: "protein", label: "חלבון", unit: "גרם" },
    { key: "carbs", label: "פחמימה", unit: "גרם" },
    { key: "fat", label: "שומן", unit: "גרם" },
    { key: "calories", label: "קלוריות", unit: "קל׳" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[14px] font-light text-slate-400 dark:text-slate-500">
      {items.map((item, idx) => (
        <span key={item.key} className="inline-flex items-baseline gap-1 whitespace-nowrap">
          {idx > 0 && (
            <span className="me-2 text-slate-200/70 dark:text-slate-700/70" aria-hidden>
              |
            </span>
          )}
          <span className="text-slate-400 dark:text-slate-500">{item.label}</span>
          <span className="text-slate-300/60 dark:text-slate-600/60">-</span>
          <span
            className={`text-[16px] font-medium ${
              item.key === "calories"
                ? "bg-gradient-to-l from-emerald-300 to-emerald-700 bg-clip-text font-bold text-transparent"
                : "text-slate-500 dark:text-slate-300"
            }`}
          >
            {displayed[item.key] || 0}
          </span>
          <span className="text-[10px] font-light text-slate-300 dark:text-slate-500">
            {item.unit}
          </span>
        </span>
      ))}
    </div>
  );
};

export default MealCard;
