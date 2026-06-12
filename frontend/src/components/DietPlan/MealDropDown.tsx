import { FC, useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa6";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "../ui/input";
import { CustomItems, DietItemQuantityBlock, IDietPlan } from "@/interfaces/IDietPlan";
import { CustomItemSelection } from "./CustomItemSelection";
import ExtraItems from "./ExtraItems";
import CustomRadioGroup from "../ui/CustomRadioGroup";

const dietRadioItems = [
  { id: "Custom", label: "בחירה", value: "Custom" },
  { label: "קבוע", id: "Fixed", value: "Fixed" },
];

const mealSections = [
  {
    key: "totalProtein",
    label: "כמות חלבון",
    short: "חלבון",
    source: "protein",
    chip: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
  },
  {
    key: "totalCarbs",
    label: "כמות פחמימות",
    short: "פחמ׳",
    source: "carbs",
    chip: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  },
  {
    key: "totalFats",
    label: "כמות שומנים",
    short: "שומן",
    source: "fats",
    chip: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300",
  },
  {
    key: "totalVeggies",
    label: "כמות ירקות",
    short: "ירק",
    source: "vegetables",
    chip: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
  },
] as const;

type SectionKey = (typeof mealSections)[number]["key"];
type SectionSource = (typeof mealSections)[number]["source"];
type ItemSelection = "Custom" | "Fixed";

type ShowCustomSelectionType = Record<SectionKey, boolean>;
type CustomValues = Record<SectionKey, string[]>;

type MealDropDownProps = {
  mealNumber: number;
  mealIndex: number;
  customItems: CustomItems;
  onDelete: () => void;
};

type MealValue = IDietPlan["meals"][number];

const createEmptyCustomValues = (): CustomValues =>
  mealSections.reduce((acc, section) => {
    acc[section.key] = [];
    return acc;
  }, {} as CustomValues);

const extractCustomValues = (
  meal: MealValue | undefined,
  key: keyof DietItemQuantityBlock
): CustomValues =>
  mealSections.reduce((acc, section) => {
    const block = meal?.[section.key] as DietItemQuantityBlock | undefined;
    const value = block?.[key];
    acc[section.key] = Array.isArray(value) ? value : [];
    return acc;
  }, createEmptyCustomValues());

const createEmptyShowState = (): ShowCustomSelectionType =>
  mealSections.reduce((acc, section) => {
    acc[section.key] = false;
    return acc;
  }, {} as ShowCustomSelectionType);

const extractShowCustomSelection = (meal: MealValue | undefined): ShowCustomSelectionType =>
  mealSections.reduce((acc, section) => {
    const block = meal?.[section.key] as DietItemQuantityBlock | undefined;
    acc[section.key] = Boolean(block?.customItems?.length || block?.extraItems?.length);
    return acc;
  }, createEmptyShowState());

export const MealDropDown: FC<MealDropDownProps> = ({
  mealNumber,
  mealIndex,
  customItems,
  onDelete,
}) => {
  const form = useFormContext<IDietPlan>();
  const { control, setValue, getValues } = form;
  const mealPath = `meals.${mealIndex}` as const;
  const meal = useWatch({ control, name: mealPath });

  const [isOpen, setIsOpen] = useState(false);

  const initialCustomValues = useMemo(() => extractCustomValues(meal, "customItems"), [meal]);
  const initialExtraValues = useMemo(() => extractCustomValues(meal, "extraItems"), [meal]);
  const initialShowState = useMemo(() => extractShowCustomSelection(meal), [meal]);

  const [storedCustomItems, setStoredCustomItems] = useState<CustomValues>(initialCustomValues);
  const [storedExtraItems, setStoredExtraItems] = useState<CustomValues>(initialExtraValues);
  const [showCustomSelection, setShowCustomSelection] =
    useState<ShowCustomSelectionType>(initialShowState);

  const handleToggleCustomItem = (
    selectedItems: string[],
    sectionKey: SectionKey,
    key: keyof Pick<DietItemQuantityBlock, "customItems" | "extraItems">
  ) => {
    if (key === "customItems") {
      setStoredCustomItems((prev) => ({ ...prev, [sectionKey]: selectedItems }));
    } else {
      setStoredExtraItems((prev) => ({ ...prev, [sectionKey]: selectedItems }));
    }
    setValue(`${mealPath}.${sectionKey}.${key}` as const, selectedItems, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleChangeItemSelectionType = (type: ItemSelection, field: SectionKey) => {
    const isCustom = type === "Custom";
    setShowCustomSelection((prev) => ({ ...prev, [field]: isCustom }));
    const customItemsValue = isCustom ? storedCustomItems[field] : [];
    const extraItemsValue = isCustom ? storedExtraItems[field] : [];
    setValue(`${mealPath}.${field}.customItems` as const, customItemsValue, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue(`${mealPath}.${field}.extraItems` as const, extraItemsValue, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const getSectionItems = (source: SectionSource) => customItems?.[source] || [];

  useEffect(() => {
    const currentMeal = getValues(mealPath);
    if (!currentMeal) return;
    setStoredCustomItems(extractCustomValues(currentMeal, "customItems"));
    setStoredExtraItems(extractCustomValues(currentMeal, "extraItems"));
    setShowCustomSelection(extractShowCustomSelection(currentMeal));
  }, [getValues, mealIndex, mealPath]);

  return (
    <Collapsible
      dir="rtl"
      open={isOpen}
      onOpenChange={setIsOpen}
      className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-heebo shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((s) => !s)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((s) => !s);
          }
        }}
        className="flex cursor-pointer select-none items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
        aria-expanded={isOpen}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((s) => !s);
          }}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
            isOpen
              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
              : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
          aria-label={isOpen ? "סגור ארוחה" : "פתח ארוחה"}
        >
          {isOpen ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
        </button>

        <span className="shrink-0 text-sm font-bold text-slate-900 dark:text-slate-100">
          ארוחה {mealNumber}
        </span>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {mealSections.map((section) => {
            const block = meal?.[section.key] as DietItemQuantityBlock | undefined;
            const q = Number(block?.quantity) || 0;
            if (q <= 0) return null;
            return (
              <span
                key={section.key}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${section.chip}`}
              >
                {section.short}
                <span className="mx-1 opacity-60">×</span>
                <span>{q}</span>
              </span>
            );
          })}
          {mealSections.every((s) => {
            const block = meal?.[s.key] as DietItemQuantityBlock | undefined;
            return !(Number(block?.quantity) || 0);
          }) && <span className="text-xs text-slate-400 dark:text-slate-500">אין מנות עדיין</span>}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400"
          aria-label="הסר ארוחה"
        >
          <FaTrash size={11} />
        </button>
      </div>

      <CollapsibleContent className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 px-5 py-4">
        <div className="grid gap-4 md:grid-cols-2">
          {mealSections.map((section) => {
            const quantityName = `meals.${mealIndex}.${section.key}.quantity` as const;
            const isCustom = showCustomSelection[section.key];

            return (
              <FormField
                key={section.key}
                control={control}
                name={quantityName}
                render={({ field }) => (
                  <FormItem className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <FormLabel className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {section.label}
                      </FormLabel>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${section.chip}`}
                      >
                        {section.short}
                      </span>
                    </div>
                    <FormControl>
                      <Input dir="rtl" type="number" {...field} className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage />

                    <CustomRadioGroup
                      className="flex items-center gap-2 text-xs"
                      value={isCustom ? "Custom" : "Fixed"}
                      onValueChange={(val: ItemSelection) =>
                        handleChangeItemSelectionType(val, section.key)
                      }
                      items={dietRadioItems}
                    />

                    {isCustom && (
                      <div className="space-y-2 pt-2">
                        <CustomItemSelection
                          items={getSectionItems(section.source)}
                          selectedItems={
                            (getValues(
                              `${mealPath}.${section.key}.customItems` as const
                            ) as string[]) || []
                          }
                          onItemToggle={(selectedItems) =>
                            handleToggleCustomItem(selectedItems, section.key, "customItems")
                          }
                        />
                        <ExtraItems
                          section={section.key}
                          existingItems={
                            (getValues(
                              `${mealPath}.${section.key}.extraItems` as const
                            ) as string[]) || []
                          }
                          onAddItem={(items) =>
                            handleToggleCustomItem(items, section.key, "extraItems")
                          }
                          trigger={
                            <Button variant="secondary" type="button" size="sm">
                              פריטים נוספים
                            </Button>
                          }
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
