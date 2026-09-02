import { useState } from "react";
import {
  FaBoltLightning,
  FaChevronDown,
  FaChevronUp,
  FaCopy,
  FaGripVertical,
  FaPuzzlePiece,
  FaTrashCan,
  FaUtensils,
} from "react-icons/fa6";

import type {
  DietV2Category,
  DietV2Meal,
  DietV2MealCategory,
  IMacros,
} from "@/interfaces/IDietPlanV2";

import AddOnsFields from "./AddOnsFields";
import CategorySection from "./CategorySection";
import type { MealSibling } from "./CategorySection";
import FreeCaloriesFields from "./FreeCaloriesFields";
import { deriveMealMacros, DIET_V2_DEFAULT_CATEGORIES } from "./dietPlanV2Utils";

export type { MealSibling };

interface MealCardProps {
  meal: DietV2Meal;
  index: number;
  collapsed: boolean;
  siblingMeals: MealSibling[];
  onCopyCategoryToMeal: (category: DietV2MealCategory, targetMealId: string) => void;
  onCopyCategoryToNewMeal: (category: DietV2MealCategory) => void;
  onChange: (meal: DietV2Meal) => void;
  onToggleCollapse: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  canRemove: boolean;
  onDragStart: () => void;
  onDragOver: (event: React.DragEvent) => void;
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
  canRemove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDropTarget,
}) => {
  const addOns = meal.addOns ?? [];
  const [addOnsActivated, setAddOnsActivated] = useState(addOns.length > 0);
  const [freeCaloriesActivated, setFreeCaloriesActivated] = useState(!!meal.freeCalories);
  const totalItems =
    meal.categories.reduce((total, category) => total + category.items.length, 0) + addOns.length;
  const displayedCategories: DietV2Category[] = DIET_V2_DEFAULT_CATEGORIES.map(
    (category) =>
      meal.categories.find((candidate) => candidate.category === category) ?? {
        category,
        items: [],
      }
  );
  const mealMacros = deriveMealMacros({ categories: displayedCategories });

  const updateCategory = (categoryName: DietV2MealCategory, next: DietV2Category) => {
    const exists = meal.categories.some((category) => category.category === categoryName);
    const categories = exists
      ? meal.categories.map((category) => (category.category === categoryName ? next : category))
      : [...meal.categories, next];
    onChange({ ...meal, categories, macros: deriveMealMacros({ categories }) });
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
        className="group flex cursor-pointer flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-l from-blue-50/60 to-white px-4 py-3 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-slate-900"
      >
        <div className="flex min-w-[220px] items-center gap-2.5">
          <span
            draggable
            onDragStart={onDragStart}
            onClick={(event) => event.stopPropagation()}
            title="גרור לסידור הארוחות"
            className="flex h-9 w-5 cursor-grab items-center justify-center text-slate-300 transition-colors hover:text-blue-500 active:cursor-grabbing"
          >
            <FaGripVertical size={11} />
          </span>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl brand-gradient text-white shadow-md shadow-blue-500/25">
            <FaUtensils size={13} />
          </div>
          <div className="min-w-0" onClick={(event) => event.stopPropagation()}>
            <input
              value={meal.name}
              onChange={(event) => onChange({ ...meal, name: event.target.value })}
              className="w-full bg-transparent text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
              placeholder={`ארוחה ${index}`}
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {totalItems} פריטים · {displayedCategories.length} קטגוריות
            </p>
          </div>
        </div>

        <div onClick={(event) => event.stopPropagation()}>
          <MealMacroInline macros={mealMacros} freeCalories={meal.freeCalories?.calories} />
        </div>

        <div className="flex items-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
          <HeaderButton label={collapsed ? "פתח ארוחה" : "סגור ארוחה"} onClick={onToggleCollapse}>
            {collapsed ? <FaChevronDown size={11} /> : <FaChevronUp size={11} />}
          </HeaderButton>
          <button
            type="button"
            title="הוסף תוספים לארוחה"
            onClick={(event) => {
              event.stopPropagation();
              if (collapsed) onToggleCollapse();
              setAddOnsActivated(true);
              if (!meal.addOns) onChange({ ...meal, addOns: [] });
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-2.5 text-[11px] font-bold text-blue-600 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/40 dark:bg-slate-900 dark:text-blue-300"
          >
            <FaPuzzlePiece size={12} />
            <span>תוספים</span>
          </button>
          <button
            type="button"
            title="הוסף קלוריות חופשיות לארוחה"
            onClick={(event) => {
              event.stopPropagation();
              if (collapsed) onToggleCollapse();
              setFreeCaloriesActivated(true);
              if (!meal.freeCalories)
                onChange({ ...meal, freeCalories: { calories: 0, items: [] } });
            }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-2.5 text-[11px] font-bold text-blue-600 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/40 dark:bg-slate-900 dark:text-blue-300"
          >
            <FaBoltLightning size={12} />
            <span>קלוריות חופשיות</span>
          </button>
          <HeaderButton label="שכפל ארוחה" onClick={onDuplicate}>
            <FaCopy size={11} />
          </HeaderButton>
          <HeaderButton label="הסר ארוחה" onClick={onRemove} disabled={!canRemove} destructive>
            <FaTrashCan size={11} />
          </HeaderButton>
        </div>
      </header>

      {!collapsed && (
        <div className="flex flex-col gap-3 p-4">
          {displayedCategories.map((category, categoryIndex) => (
            <CategorySection
              key={category.category}
              category={category}
              mealIndex={index - 1}
              categoryIndex={categoryIndex}
              siblingMeals={siblingMeals}
              onCopyToMeal={(targetId) => onCopyCategoryToMeal(category.category, targetId)}
              onCopyToNewMeal={() => onCopyCategoryToNewMeal(category.category)}
              onChange={(next) => updateCategory(category.category, next)}
            />
          ))}

          {addOnsActivated && (
            <AddOnsFields
              value={addOns}
              onChange={(next) => onChange({ ...meal, addOns: next })}
              onRemove={() => {
                onChange({ ...meal, addOns: [] });
                setAddOnsActivated(false);
              }}
            />
          )}

          {freeCaloriesActivated && (
            <FreeCaloriesFields
              value={meal.freeCalories}
              onChange={(freeCalories) => onChange({ ...meal, freeCalories })}
              onRemove={() => {
                onChange({ ...meal, freeCalories: undefined });
                setFreeCaloriesActivated(false);
              }}
            />
          )}
        </div>
      )}
    </article>
  );
};

interface HeaderButtonProps {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const HeaderButton: React.FC<HeaderButtonProps> = ({
  label,
  onClick,
  destructive = false,
  disabled = false,
  children,
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className={`flex h-8 w-8 items-center justify-center rounded-lg border bg-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-y-0 dark:bg-slate-900 ${
      destructive
        ? "border-rose-100 text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300"
        : "border-blue-100 text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/40 dark:text-blue-300"
    }`}
  >
    {children}
  </button>
);

interface MealMacroInlineProps {
  macros: IMacros;
  freeCalories?: number;
}

const displayMacro = (value: number | undefined): number =>
  Number.isFinite(value) ? (value as number) : 0;

const MealMacroInline: React.FC<MealMacroInlineProps> = ({ macros, freeCalories }) => (
  <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
    <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-300">
      {displayMacro(macros.calories)} קק״ל
    </span>
    <span>{displayMacro(macros.protein)} ג׳ חלבון</span>
    <span>{displayMacro(macros.carbs)} ג׳ פחמימה</span>
    <span>{displayMacro(macros.fat)} ג׳ שומן</span>
    {!!freeCalories && (
      <span className="rounded-full border border-dashed border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
        + {freeCalories} חופשי
      </span>
    )}
  </div>
);

export default MealCard;
