import { useEffect, useState } from "react";
import { FaFolderOpen, FaPlus, FaTrashCan } from "react-icons/fa6";

import type {
  DietV2Category,
  DietV2CategoryKind,
  DietV2MealMacroMode,
  DietV2Option,
} from "@/interfaces/IDietPlanV2";
import { formatUnitLabel } from "@/interfaces/IDietPlanV2";

import {
  CATEGORY_LABELS,
  CATEGORY_TONES,
  computeCategoryAverage,
  computeMacrosFromFood,
  estimateMacrosForUnknown,
  isPlateDescription,
  makeLocalId,
  parseCompoundQuickAdd,
  primaryMacroForCategory,
  type FoodLibraryItem,
} from "./dietPlanV2Utils";
import { getRankedSuggestions, recordFoodUsage } from "./dietPlanV2FoodHistory";
import FoodPicker from "./FoodPicker";
import OptionRow from "./OptionRow";
import CopyCategoryButton, { type MealSibling } from "./CopyCategoryButton";
import { CategoryAverageBadges, CategoryManualInputs } from "./CategoryHeaderMacros";

export type { MealSibling };

interface CategorySectionProps {
  category: DietV2Category;
  onChange: (category: DietV2Category) => void;
  /** Parent meal's macro mode. When "manual" the category header
   *  swaps its computed-average badges for editable inputs so the
   *  trainer can type per-category values without relying on the
   *  AI / library lookup. Defaults to "auto". */
  macroMode?: DietV2MealMacroMode;
  /** Other meals in the same plan — targets for the "copy this
   *  category-block to another meal" icon in the header. Hidden
   *  entirely when there are no siblings (single-meal plan). */
  siblingMeals?: MealSibling[];
  /** Clone this category's options into the target meal's same
   *  category. Non-destructive: appends to target. */
  onCopyToMeal?: (targetMealId: string) => void;
  /** Create a NEW meal and seed it with this category's options.
   *  Used when the trainer picks "ארוחה חדשה" from the copy popover
   *  — no need to add-then-copy manually. */
  onCopyToNewMeal?: () => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  onChange,
  macroMode = "auto",
  siblingMeals = [],
  onCopyToMeal,
  onCopyToNewMeal,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  // Per-category collapse — the trainer edits one category at a time
  // and the other three become a compact summary strip. Reduces the
  // "too many nested boxes" feel without hiding data. Defaults to
  // CLOSED: expanding a meal reveals a clean list of 4 category
  // headers; the trainer opens whichever they intend to edit.
  const [collapsed, setCollapsed] = useState(true);
  const tone = CATEGORY_TONES[category.kind];

  const primaryMacro = primaryMacroForCategory(category.kind);
  const primaryAvg = primaryMacro ? computeCategoryAverage(category, primaryMacro) : 0;
  const calAvg = computeCategoryAverage(category, "calories");
  const hasOptions = category.options.length > 0;
  const estimatedCount = category.options.filter((opt) => opt.estimated).length;
  const reliableCount = category.options.length - estimatedCount;

  const onFoodSelected = (food: FoodLibraryItem, overrideQuantity?: number) => {
    const quantity =
      overrideQuantity ?? food.defaultQuantity ?? (food.defaultUnit === "g" ? 100 : 1);
    const newOption: DietV2Option = {
      id: makeLocalId("option"),
      foodName: food.name,
      quantity,
      unit: food.defaultUnit,
      macros: computeMacrosFromFood(food, quantity),
    };
    onChange({ ...category, options: [...category.options, newOption] });
    recordFoodUsage(category.kind, food.id);
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
    const parsedItems = parseCompoundQuickAdd(raw, category.kind);
    if (parsedItems.length === 0) return false;

    const newOptions: DietV2Option[] = parsedItems.map((parsed) => {
      // Library match → exact macros. Otherwise → category-level
      // estimate. Either way, the row lands with whatever the
      // trainer typed as the name so nothing gets silently dropped.
      const macros = parsed.matchedFood
        ? computeMacrosFromFood(parsed.matchedFood, parsed.quantity, parsed.unit)
        : estimateMacrosForUnknown(parsed.quantity, parsed.unit, category.kind);

      return {
        id: makeLocalId("option"),
        foodName: parsed.foodName,
        quantity: parsed.quantity,
        unit: parsed.unit,
        macros,
        estimated: !parsed.matchedFood,
      };
    });

    parsedItems.forEach((parsed) => {
      if (parsed.matchedFood) recordFoodUsage(category.kind, parsed.matchedFood.id);
    });
    onChange({ ...category, options: [...category.options, ...newOptions] });
    return true;
  };

  // Search state is hoisted out of the input so the chip strip can
  // render as a sibling BELOW the header row while sharing the same
  // state as the inline search bar in the header.
  const quickAdd = useQuickAddController(category.kind, submitQuickAdd, onFoodSelected);

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
    <section dir="rtl" className="flex flex-col gap-2 py-1">
      {/* One rectangle wraps the whole "add area" for this category:
          the header row (chevron + label + count + macros summary),
          the search input, and the ambient chip strip. Options grid
          renders OUTSIDE this rectangle as ambient rows below. */}
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200/70 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
      <header
        onClick={() => setCollapsed((v) => !v)}
        className="flex cursor-pointer items-center gap-2"
        title={collapsed ? "פתח קטגוריה" : "קפל קטגוריה"}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed((v) => !v);
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
        <span
          className={`inline-flex h-8 shrink-0 items-center rounded-md ${tone.chip} px-3 text-sm font-bold ${tone.chipText}`}
        >
          {CATEGORY_LABELS[category.kind]}
        </span>
        {hasOptions && (
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {category.options.length}
          </span>
        )}
        {/* Inline quick-add when expanded — same row as chevron /
            label / macros. When collapsed, the search bar is
            replaced by a soft-grey preview strip listing the option
            names in this category so the trainer sees "what's here"
            without expanding. */}
        {!collapsed && (
          <div className="min-w-[180px] flex-1" onClick={(e) => e.stopPropagation()}>
            <QuickAddSearchBar
              categoryKind={category.kind}
              value={quickAdd.value}
              onValueChange={quickAdd.handleChange}
              onKeyDown={quickAdd.handleKeyDown}
              onSubmit={quickAdd.tryAdd}
              onOpenPicker={() => setPickerOpen(true)}
            />
          </div>
        )}
        {collapsed && hasOptions && (
          <CategoryOptionsPreview options={category.options} />
        )}
        <div className="ms-auto" onClick={(e) => e.stopPropagation()}>
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
        </div>
        {/* Category-level actions on the far left (end in RTL):
            copy this category-block to another meal, and clear all
            of this category's options at once. Visible in both open
            and collapsed states so the trainer can act on a folded
            category without expanding it first. */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
            title={`נקה את כל האפשרויות של ${CATEGORY_LABELS[category.kind]}`}
            aria-label="נקה קטגוריה"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400 dark:hover:bg-rose-950/40"
          >
            <FaTrashCan size={12} />
          </button>
        </div>
      </header>

      {!collapsed && quickAdd.showSuggestions && (
        <QuickAddSuggestionList
          suggestions={quickAdd.suggestions}
          highlightIdx={quickAdd.highlightIdx}
          categoryKind={category.kind}
          onPick={quickAdd.commitSuggestion}
          onHover={quickAdd.setHighlightIdx}
          hasQuery={quickAdd.hasQuery}
        />
      )}
      {!collapsed && quickAdd.error && (
        <span className="px-2 text-[10px] font-bold text-rose-600 dark:text-rose-400">
          לא הצלחתי לפענח — נסה "כמות + יחידה + שם" (לדוגמה "300 גרם אורז")
        </span>
      )}
      {/* Options grid sits INSIDE the rectangle so the rows visibly
          belong to their category — no dangling boxes below. A hair
          line at the top separates them from the search/chips area
          without being another full frame. */}
      {!collapsed && hasOptions && (
        <div className="mt-1 grid grid-cols-2 gap-1.5 border-t border-slate-100 pt-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 dark:border-slate-800">
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

// Compound rows preserve the trainer's typed text as the `foodName`
// (e.g. "2 ביצים + חצי גביע קוטג"); the quantity/unit fields don't
// carry meaning there, so we show the name verbatim.
const isCompoundOptionName = (foodName: string): boolean =>
  /[+,]/.test(foodName) || / ו-?/.test(foodName);

const formatOptionForPreview = (option: DietV2Option): string => {
  if (isCompoundOptionName(option.foodName)) return option.foodName;

  const unitLabel = formatUnitLabel(option.unit, option.quantity);
  return `${option.quantity} ${unitLabel} ${option.foodName}`.trim();
};

/**
 * Soft-grey ribbon that replaces the search bar when a category is
 * folded — shows each option as "quantity unit name", separated by
 * " / ", so the trainer sees the full portion at a glance without
 * expanding. Truncates with a CSS ellipsis when the list is long;
 * the `title` attribute exposes the full text on hover.
 */
const CategoryOptionsPreview: React.FC<{ options: DietV2Option[] }> = ({ options }) => {
  const fullText = options.map(formatOptionForPreview).join(" / ");

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      title={fullText}
      className="min-w-[180px] flex-1 truncate rounded-md bg-slate-100/70 px-3 py-2 text-[13px] font-medium text-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
    >
      {fullText}
    </div>
  );
};

export default CategorySection;

/**
 * Search state + handlers for the category's quick-add flow.
 * Extracted into a hook so the input row and the chip strip can be
 * rendered in DIFFERENT parts of the layout while sharing state —
 * the input sits inline in the category header, the chip strip
 * flows below it inside the same rectangle.
 *
 * Suggestions come from `getRankedSuggestions` — the trainer's own
 * pick-history (localStorage today) mixed with library defaults.
 * TODO(Michael): swap the localStorage store for a server-scoped
 * history endpoint per trainer; see dietPlanV2FoodHistory.ts.
 */
function useQuickAddController(
  categoryKind: DietV2CategoryKind,
  onQuickAdd: (raw: string) => boolean,
  onDirectAdd: (food: FoodLibraryItem, quantity?: number) => void
) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);

  const trimmed = value.trim();
  // Compound entries ("חביתה 3 ביצים + 3 פרוסות גבינה") describe a
  // plate, not a single food — hide the chip grid entirely so Enter
  // falls through to the free-text parser and the raw text is
  // preserved verbatim. Detect any of +, comma, or " ו-", plus
  // sandwiched-digit "plate descriptions" ("חביתה 2 ביצים").
  const isCompoundText =
    /[+,]/.test(trimmed) || / ו-?/.test(trimmed) || isPlateDescription(trimmed);
  const CHIP_DEFAULT_COUNT = 5;
  const CHIP_SEARCH_COUNT = 8;
  const hasQuery = trimmed.length > 0;
  const suggestions = isCompoundText
    ? []
    : getRankedSuggestions(trimmed, categoryKind, hasQuery ? CHIP_SEARCH_COUNT : CHIP_DEFAULT_COUNT);
  const showSuggestions = suggestions.length > 0;

  useEffect(() => {
    // Reset highlight to the top whenever the visible list changes,
    // otherwise the highlighted index can point off the end after a
    // narrower query trims the list.
    setHighlightIdx(0);
  }, [suggestions.length, trimmed]);

  const commitSuggestion = (food: FoodLibraryItem) => {
    onDirectAdd(food);
    setValue("");
    setError(false);
    setHighlightIdx(0);
  };

  const tryAdd = () => {
    if (!value.trim()) return;
    // If the dropdown has a highlighted item, prefer that — the
    // trainer's intent is clearly the suggestion they see.
    if (showSuggestions && suggestions[highlightIdx]) {
      commitSuggestion(suggestions[highlightIdx]);
      return;
    }
    const ok = onQuickAdd(value);
    if (ok) {
      setValue("");
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setHighlightIdx((idx) => Math.min(idx + 1, suggestions.length - 1));
      return;
    }
    if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setHighlightIdx((idx) => Math.max(idx - 1, 0));
      return;
    }
    if ((e.key === "Enter" || e.key === "Tab") && showSuggestions) {
      const picked = suggestions[highlightIdx];
      if (picked) {
        e.preventDefault();
        commitSuggestion(picked);
        return;
      }
    }
    if (e.key === "Enter") {
      e.preventDefault();
      tryAdd();
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
    if (error) setError(false);
  };

  return {
    value,
    error,
    hasQuery,
    highlightIdx,
    suggestions,
    showSuggestions,
    setHighlightIdx,
    handleChange,
    handleKeyDown,
    tryAdd,
    commitSuggestion,
  };
}

/** Compact input row for quick-add — designed to sit INLINE inside
 *  the category header row. Purely presentational; state lives in
 *  the parent's `useQuickAddController` hook. */
function QuickAddSearchBar({
  categoryKind,
  value,
  onValueChange,
  onKeyDown,
  onSubmit,
  onOpenPicker,
}: {
  categoryKind: DietV2CategoryKind;
  value: string;
  onValueChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  onSubmit: () => void;
  onOpenPicker: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50/40 px-1.5 py-1 transition-colors focus-within:border-blue-400 focus-within:bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20 dark:focus-within:border-blue-700 dark:focus-within:bg-blue-950/40">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-blue-600 dark:text-blue-300">
        <FaPlus size={10} />
      </span>
      <input
        value={value}
        onChange={onValueChange}
        onKeyDown={onKeyDown}
        placeholder={`לדוגמה: 300 גרם ${CATEGORY_LABELS[categoryKind]}…`}
        className="min-w-0 flex-1 bg-transparent py-0.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
      />
      <button
        type="button"
        onClick={onOpenPicker}
        title="פתח רשימת מאכלים"
        className="flex h-7 w-7 items-center justify-center rounded-md text-blue-600 transition-colors hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/40"
      >
        <FaFolderOpen size={12} />
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim()}
        className="rounded-md brand-gradient brand-gradient-hover px-3 py-1.5 text-[11px] font-bold text-white shadow-sm shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
      >
        הוסף
      </button>
    </div>
  );
}

/**
 * Ambient "+ chip" strip — visual pattern lifted from v1's food
 * picker but stripped to the essentials: click a chip to add the
 * food IMMEDIATELY as an option (default quantity from the food's
 * own defaults). If the trainer needs a non-default amount, they
 * edit the row's quantity inline once it appears in the category
 * below. Foods that aren't in the visible 5 can always be reached
 * through the search input above (typing narrows the chip list).
 */
function QuickAddSuggestionList({
  suggestions,
  highlightIdx,
  categoryKind: _categoryKind,
  onPick,
  onHover,
  hasQuery,
}: {
  suggestions: FoodLibraryItem[];
  highlightIdx: number;
  categoryKind: DietV2CategoryKind;
  onPick: (food: FoodLibraryItem) => void;
  onHover: (idx: number) => void;
  hasQuery: boolean;
}) {
  return (
    <div
      dir="rtl"
      className="flex flex-wrap items-center gap-1.5 rounded-xl border border-blue-100 bg-white/60 p-2 dark:border-blue-900/40 dark:bg-slate-950/40"
    >
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
        {hasQuery ? "תוצאות חיפוש:" : "מוצעים לך:"}
      </span>
      {suggestions.map((food, idx) => {
        const isActive = idx === highlightIdx;
        return (
          <button
            key={food.id}
            type="button"
            onMouseEnter={() => onHover(idx)}
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(food);
            }}
            title="לחץ להוספה"
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${
              isActive
                ? "border-blue-400 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-900/40 dark:text-blue-100"
                : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:bg-blue-950/40"
            }`}
          >
            <span className="text-[13px] leading-none">+</span>
            <span>{food.name}</span>
          </button>
        );
      })}
    </div>
  );
}
