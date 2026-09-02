import { useState } from "react";
import { FaTrashCan } from "react-icons/fa6";
import { toast } from "sonner";

import type { DietV2Category } from "@/interfaces/IDietPlanV2";

import CatalogQuickAdd from "./CatalogQuickAdd";
import CategoryMacroFields from "./CategoryMacroFields";
import CopyCategoryButton, { type MealSibling } from "./CopyCategoryButton";
import OptionRow from "./OptionRow";
import { CATEGORY_LABELS, CATEGORY_TONES } from "./dietPlanV2Utils";
import { useUpdateDietV2CatalogItem } from "@/hooks/mutations/dietV2Catalog/useUpdateDietV2CatalogItem";

export type { MealSibling };

interface CategorySectionProps {
  category: DietV2Category;
  mealIndex: number;
  categoryIndex: number;
  onChange: (category: DietV2Category) => void;
  siblingMeals?: MealSibling[];
  onCopyToMeal?: (targetMealId: string) => void;
  onCopyToNewMeal?: () => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  mealIndex,
  categoryIndex,
  onChange,
  siblingMeals = [],
  onCopyToMeal,
  onCopyToNewMeal,
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const updateCatalogItem = useUpdateDietV2CatalogItem();
  const tone = CATEGORY_TONES[category.category];
  const hasItems = category.items.length > 0;
  const preview = category.items.map((item) => item.name).join(" / ");
  const renameItem = (index: number, name: string) => {
    const normalized = name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    if (
      category.items.some(
        (candidate, candidateIndex) =>
          candidateIndex !== index &&
          candidate.name.trim().replace(/\s+/g, " ").toLocaleLowerCase() === normalized
      )
    ) {
      toast.error("המאכל כבר קיים בקטגוריה הזו");
      return;
    }

    const apply = () =>
      onChange({
        ...category,
        items: category.items.map((candidate, candidateIndex) =>
          candidateIndex === index ? { ...candidate, name } : candidate
        ),
      });
    const item = category.items[index];
    if (item.catalogItemId) {
      updateCatalogItem.mutate({ id: item.catalogItemId, name }, { onSuccess: apply });
    } else {
      apply();
    }
  };

  return (
    <section
      dir="rtl"
      data-testid={`diet-v2-category-${category.category}`}
      className="group rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm shadow-slate-500/5 dark:border-slate-800 dark:bg-slate-900/60"
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? "פתח קטגוריה" : "קפל קטגוריה"}
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
          <>
            <div className="min-w-0 flex-1">
              <CatalogQuickAdd
                category={category.category}
                categoryLabel={CATEGORY_LABELS[category.category]}
                existingItems={category.items}
                onAdd={(item) =>
                  onChange({ ...category, items: [...category.items, item], macros: undefined })
                }
              />
            </div>

            {hasItems && (
              <div className="min-w-0 md:w-[380px] md:shrink-0">
                <CategoryMacroFields
                  categoryLabel={CATEGORY_LABELS[category.category]}
                  category={category.category}
                  value={category.macros}
                  mealIndex={mealIndex}
                  categoryIndex={categoryIndex}
                  onChange={(macros) => onChange({ ...category, macros })}
                />
              </div>
            )}
          </>
        )}

        {collapsed && (
          <p
            className="min-w-[180px] flex-1 truncate px-2 text-base font-light text-slate-400"
            title={preview}
          >
            {CATEGORY_LABELS[category.category]}: {preview}
          </p>
        )}

        <div
          className={`mr-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 ${collapsed ? "flex-row" : "flex-col"}`}
        >
          {onCopyToMeal && (
            <CopyCategoryButton
              categoryLabel={CATEGORY_LABELS[category.category]}
              siblingMeals={siblingMeals}
              onCopyToMeal={onCopyToMeal}
              onCopyToNewMeal={onCopyToNewMeal}
              disabled={!hasItems}
            />
          )}
          <button
            type="button"
            onClick={() => onChange({ ...category, items: [], macros: undefined })}
            disabled={!hasItems}
            aria-label="נקה קטגוריה"
            title="נקה קטגוריה"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
          >
            <FaTrashCan size={11} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="mt-3 flex flex-col gap-2 pl-2 pr-12">
          {hasItems && (
            <>
              <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400">
                אופציות של {CATEGORY_LABELS[category.category]}:
              </h5>
              <div className="flex flex-wrap gap-3">
                {category.items.map((item, index) => (
                <OptionRow
                  key={`${item.catalogItemId ?? item.name}-${index}`}
                  item={item}
                  onRename={(name) => renameItem(index, name)}
                  onRemove={() =>
                    onChange({
                      ...category,
                      items: category.items.filter((_, itemIndex) => itemIndex !== index),
                      macros: undefined,
                    })
                  }
                />
              ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default CategorySection;
