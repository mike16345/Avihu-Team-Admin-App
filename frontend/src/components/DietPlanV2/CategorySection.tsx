import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaTrashCan, FaXmark } from "react-icons/fa6";

import type { DietV2Category, DietV2Option } from "@/interfaces/IDietPlanV2";
import { formatUnitLabel } from "@/interfaces/IDietPlanV2";
import { useUsersStore } from "@/store/userStore";

import CopyCategoryButton, { type MealSibling } from "./CopyCategoryButton";
import { CategoryManualInputs } from "./CategoryHeaderMacros";
import ManualFoodDialog from "./ManualFoodDialog";
import OptionRow from "./OptionRow";
import {
  getRecentFoodSuggestions,
  loadRecentFoods,
  mealContainsFood,
  RECENT_FOODS_UPDATED_EVENT,
  removeRecentFood,
  saveRecentFoods,
  upsertRecentFood,
  type RecentFood,
  type RecentFoodInput,
} from "./dietPlanV2RecentFoods";
import {
  CATEGORY_LABELS,
  CATEGORY_TONES,
  computeCategoryAverage,
  makeLocalId,
  primaryMacroForCategory,
} from "./dietPlanV2Utils";

export type { MealSibling };

interface CategorySectionProps {
  category: DietV2Category;
  existingMealFoodNames: string[];
  onChange: (category: DietV2Category) => void;
  siblingMeals?: MealSibling[];
  onCopyToMeal?: (targetMealId: string) => void;
  onCopyToNewMeal?: () => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  existingMealFoodNames,
  onChange,
  siblingMeals = [],
  onCopyToMeal,
  onCopyToNewMeal,
}) => {
  const trainerId = useUsersStore((state) => state.currentUser?._id ?? "");
  const [collapsed, setCollapsed] = useState(true);
  const [query, setQuery] = useState("");
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [duplicateError, setDuplicateError] = useState("");

  const tone = CATEGORY_TONES[category.kind];
  const primaryMacro = primaryMacroForCategory(category.kind);
  const primaryAverage = primaryMacro ? computeCategoryAverage(category, primaryMacro) : 0;
  const calorieAverage = computeCategoryAverage(category, "calories");
  const hasOptions = category.options.length > 0;
  const suggestions = useMemo(
    () => getRecentFoodSuggestions(recentFoods, query, category.kind, query.trim() ? 8 : 5),
    [category.kind, query, recentFoods]
  );

  useEffect(() => {
    setRecentFoods(loadRecentFoods(trainerId));
  }, [trainerId]);

  useEffect(() => {
    const refresh = (event: Event) => {
      if ((event as CustomEvent<string>).detail === trainerId) {
        setRecentFoods(loadRecentFoods(trainerId));
      }
    };
    window.addEventListener(RECENT_FOODS_UPDATED_EVENT, refresh);

    return () => window.removeEventListener(RECENT_FOODS_UPDATED_EVENT, refresh);
  }, [trainerId]);

  const persistRecentFoods = (foods: RecentFood[]) => {
    setRecentFoods(foods);
    saveRecentFoods(trainerId, foods);
  };

  const addFoodOption = (food: RecentFoodInput): string | null => {
    if (mealContainsFood(existingMealFoodNames, food.displayName)) {
      const message = "המאכל כבר קיים בארוחה הזו";
      setDuplicateError(message);
      return message;
    }

    const option: DietV2Option = {
      id: makeLocalId("option"),
      foodName: food.displayName.trim(),
      quantity: food.referenceQuantity,
      unit: food.unit,
      macros: food.referenceMacros,
    };
    onChange({ ...category, options: [...category.options, option] });
    persistRecentFoods(upsertRecentFood(recentFoods, food));
    setQuery("");
    setDuplicateError("");

    return null;
  };

  const addRecentFood = (food: RecentFood) => {
    addFoodOption(food);
  };

  const removeSuggestion = (id: string) => {
    persistRecentFoods(removeRecentFood(recentFoods, id));
  };

  const onSearchKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const firstSuggestion = suggestions[0];
    if (firstSuggestion) {
      addRecentFood(firstSuggestion);
      return;
    }
    if (query.trim()) setManualDialogOpen(true);
  };

  const manualInputsNode = (
    <CategoryManualInputs
      primaryMacro={primaryMacro}
      primaryGrams={category.manualPrimaryGrams ?? Math.round(primaryAverage)}
      calories={category.manualCalories ?? Math.round(calorieAverage)}
      onChange={(field, value) =>
        onChange({
          ...category,
          ...(field === "primary" ? { manualPrimaryGrams: value } : { manualCalories: value }),
        })
      }
    />
  );

  return (
    <section dir="rtl" className="flex flex-col gap-2 py-1">
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200/70 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
        <header
          onClick={() => setCollapsed((current) => !current)}
          className="flex cursor-pointer items-center gap-2"
          title={collapsed ? "פתח קטגוריה" : "קפל קטגוריה"}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setCollapsed((current) => !current);
            }}
            aria-label={collapsed ? "פתח" : "קפל"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
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
          <span className={`inline-flex h-8 shrink-0 items-center rounded-md ${tone.chip} px-3 text-sm font-bold ${tone.chipText}`}>
            {CATEGORY_LABELS[category.kind]}
          </span>
          {hasOptions && <span className="text-sm font-semibold text-slate-500">{category.options.length}</span>}
          {!collapsed && (
            <div className="min-w-[220px] flex-1" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50/40 px-2 py-1 dark:border-blue-900/40 dark:bg-blue-950/20">
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setDuplicateError("");
                  }}
                  onKeyDown={onSearchKeyDown}
                  placeholder="חפש במאכלים האחרונים…"
                  className="min-w-0 flex-1 bg-transparent py-1 text-sm font-medium placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setManualDialogOpen(true)}
                  className="inline-flex items-center gap-1 rounded-md brand-gradient brand-gradient-hover px-3 py-1.5 text-[11px] font-bold text-white"
                >
                  <FaPlus size={9} />
                  מאכל חדש
                </button>
              </div>
            </div>
          )}
          {collapsed && hasOptions && <CategoryOptionsPreview options={category.options} />}
          {!collapsed && <div onClick={(event) => event.stopPropagation()}>{manualInputsNode}</div>}
          <div
            className="mr-auto flex shrink-0 items-center gap-1"
            onClick={(event) => event.stopPropagation()}
          >
            {onCopyToMeal && (
              <CopyCategoryButton
                categoryLabel={CATEGORY_LABELS[category.kind]}
                siblingMeals={siblingMeals}
                onCopyToMeal={onCopyToMeal}
                onCopyToNewMeal={onCopyToNewMeal}
                disabled={!hasOptions}
              />
            )}
            <button
              type="button"
              onClick={() => onChange({ ...category, options: [] })}
              disabled={!hasOptions}
              aria-label="נקה קטגוריה"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
            >
              <FaTrashCan size={12} />
            </button>
          </div>
        </header>

        {!collapsed && suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-blue-100 bg-white/60 p-2 dark:border-blue-900/40 dark:bg-slate-950/40">
            <span className="text-[10px] font-bold text-slate-500">
              {query.trim() ? "תוצאות אחרונות:" : "שימוש מהיר:"}
            </span>
            {suggestions.map((food) => (
              <span key={food.id} className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => addRecentFood(food)}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200"
                >
                  + {food.displayName}
                </button>
                <button
                  type="button"
                  onClick={() => removeSuggestion(food.id)}
                  aria-label={`הסר ${food.displayName} מהרשימה`}
                  className="border-r border-slate-200 px-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700"
                >
                  <FaXmark size={8} />
                </button>
              </span>
            ))}
          </div>
        )}
        {!collapsed && duplicateError && (
          <p className="px-2 text-[11px] font-bold text-rose-600 dark:text-rose-400">
            {duplicateError}
          </p>
        )}

        {!collapsed && hasOptions && (
          <div className="mt-1 grid grid-cols-1 gap-1.5 border-t border-slate-100 pt-2 sm:grid-cols-2 lg:grid-cols-3 dark:border-slate-800">
            {category.options.map((option, index) => (
              <OptionRow
                key={option.id}
                option={option}
                onChange={(next) =>
                  onChange({
                    ...category,
                    options: category.options.map((current, currentIndex) =>
                      currentIndex === index ? next : current
                    ),
                  })
                }
                onRemove={() =>
                  onChange({
                    ...category,
                    options: category.options.filter((_, currentIndex) => currentIndex !== index),
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      <ManualFoodDialog
        open={manualDialogOpen}
        categoryKind={category.kind}
        initialName={query}
        onOpenChange={setManualDialogOpen}
        onSubmit={addFoodOption}
      />
    </section>
  );
};

const CategoryOptionsPreview: React.FC<{ options: DietV2Option[] }> = ({ options }) => {
  const fullText = options
    .map((option) =>
      `${option.quantity} ${formatUnitLabel(option.unit, option.quantity)} ${option.foodName}`.trim()
    )
    .join(" / ");

  return (
    <div title={fullText} className="min-w-[180px] flex-1 truncate rounded-md bg-slate-100/70 px-3 py-2 text-[13px] font-medium text-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
      {fullText}
    </div>
  );
};

export default CategorySection;
