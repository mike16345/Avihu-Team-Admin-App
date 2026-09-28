import { FC, useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FaChevronDown, FaChevronUp, FaTrash, FaXmark } from "react-icons/fa6";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "../ui/input";
import { servingTypeToString } from "@/lib/utils";
import { CustomItems, DietItemQuantityBlock, IDietPlan } from "@/interfaces/IDietPlan";
import { CustomItemSelection } from "./CustomItemSelection";
import CustomRadioGroup from "../ui/CustomRadioGroup";

type ServingKey = "grams" | "spoons" | "pieces" | "scoops" | "cups" | "teaSpoons" | "units";

type CatalogItem = {
  _id: string;
  name: string;
  oneServing?: Partial<Record<ServingKey, number>>;
  servingOrder?: string[];
};

interface MobilePreviewProps {
  quantity: number;
  isCustom: boolean;
  customItems: string[];
  extraItems: string[];
  catalog: CatalogItem[];
  unitMode: 1 | 2;
  sectionLabel: string;
}

const pickItemUnit = (
  item: CatalogItem,
  unitMode: 1 | 2
): { key: ServingKey; amount: number } | undefined => {
  const serving = item.oneServing || {};
  const availableKeys = Object.entries(serving).filter(
    ([, v]) => typeof v === "number" && (v as number) > 0
  ) as [ServingKey, number][];
  if (availableKeys.length === 0) return undefined;

  const orderedKeys = (item.servingOrder ?? []).filter(
    (k) => typeof (serving as any)[k] === "number" && (serving as any)[k] > 0
  ) as ServingKey[];
  const finalOrder =
    orderedKeys.length > 0 ? orderedKeys : availableKeys.map(([k]) => k);

  const index = unitMode === 2 && finalOrder.length > 1 ? 1 : 0;
  const key = finalOrder[index];
  return { key, amount: (serving as any)[key] as number };
};

const MobilePreview: FC<MobilePreviewProps> = ({
  quantity,
  isCustom,
  customItems,
  extraItems,
  catalog,
  unitMode,
  sectionLabel,
}) => {
  const hasQuantity = quantity > 0;

  const resolvedCustom = customItems
    .map((id) => catalog.find((c) => c._id === id))
    .filter(Boolean) as CatalogItem[];

  const lines: string[] = [];
  if (hasQuantity) {
    if (isCustom) {
      resolvedCustom.forEach((item) => {
        const chosen = pickItemUnit(item, unitMode);
        if (chosen) {
          const total = chosen.amount * quantity;
          lines.push(`${total} ${servingTypeToString(chosen.key)} ${item.name}`);
        } else {
          lines.push(`${quantity} מנות ${item.name}`);
        }
      });
      extraItems.forEach((name) => {
        lines.push(name);
      });
      if (resolvedCustom.length === 0 && extraItems.length === 0) {
        lines.push(`${quantity} מנות ${sectionLabel}`);
      }
    } else {
      lines.push(`${quantity} מנות ${sectionLabel}`);
    }
  }

  return (
    <div className="space-y-2">
      <div className="inline-flex items-center px-3.5 py-1 text-base font-light text-slate-500 dark:text-slate-400">
        מופיע בתפריט באפליקציה:
      </div>
      {lines.length === 0 ? (
        <div className="text-xs italic text-slate-400 dark:text-slate-500">
          — טרם הוגדר —
        </div>
      ) : (
        <>
          <div
            dir="rtl"
            className={`grid gap-x-4 gap-y-1.5 justify-items-start ${
              lines.length > 6 ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {lines.map((line, i) => (
              <div
                key={i}
                className="text-right text-[15px] text-slate-800 dark:text-slate-200"
              >
                {isCustom && lines.length > 1 && (
                  <span className="mx-1 text-slate-400 dark:text-slate-500">·</span>
                )}
                {line}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface InlineExtraItemProps {
  existingItems: string[];
  onAdd: (items: string[]) => void;
}

const InlineExtraItem: FC<InlineExtraItemProps> = ({ existingItems, onAdd }) => {
  const [value, setValue] = useState("");

  const commit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (existingItems.includes(trimmed)) {
      setValue("");
      return;
    }
    onAdd([...existingItems, trimmed]);
    setValue("");
  };

  const remove = (item: string) => {
    onAdd(existingItems.filter((i) => i !== item));
  };

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
      <Input
        dir="rtl"
        type="text"
        value={value}
        placeholder="הוסף פריט…"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        className="h-9 min-w-0 flex-1 text-sm"
      />
    </div>
  );
};

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
    chip: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "totalCarbs",
    label: "כמות פחמימות",
    short: "פחמ׳",
    source: "carbs",
    chip: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "totalFats",
    label: "כמות שומנים",
    short: "שומן",
    source: "fats",
    chip: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "totalVeggies",
    label: "כמות ירקות",
    short: "ירק",
    source: "vegetables",
    chip: "text-blue-600 dark:text-blue-400",
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
    acc[section.key] = true;
    return acc;
  }, {} as ShowCustomSelectionType);

const extractShowCustomSelection = (_meal: MealValue | undefined): ShowCustomSelectionType =>
  createEmptyShowState();

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
  const watchedUnitMode = useWatch({ control, name: "unitDisplayMode" as any }) as 1 | 2 | undefined;

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
              ? "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400"
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
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-light ${section.chip}`}
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
        <div className="flex flex-col gap-4">
          {mealSections.map((section) => {
            const quantityName = `meals.${mealIndex}.${section.key}.quantity` as const;
            const isCustom = showCustomSelection[section.key];

            return (
              <FormField
                key={section.key}
                control={control}
                name={quantityName}
                render={({ field }) => (
                  <FormItem className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex flex-col md:flex-row md:divide-x-reverse md:divide-x md:divide-slate-200 dark:md:divide-slate-800 md:gap-0">
                      <div className="flex-1 space-y-2 md:pl-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-3.5 py-1 text-base font-light ${section.chip}`}
                          >
                            מנות {section.short}
                          </span>
                        </div>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input
                              dir="rtl"
                              type="number"
                              step="0.1"
                              {...field}
                              placeholder="כמות"
                              className="h-9 w-24 shrink-0 text-sm"
                            />
                            {isCustom && (
                              <InlineExtraItem
                                existingItems={
                                  (getValues(
                                    `${mealPath}.${section.key}.extraItems` as const
                                  ) as string[]) || []
                                }
                                onAdd={(items) =>
                                  handleToggleCustomItem(items, section.key, "extraItems")
                                }
                              />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />

                        {isCustom && (
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
                            extraItems={
                              (getValues(
                                `${mealPath}.${section.key}.extraItems` as const
                              ) as string[]) || []
                            }
                            onExtraItemsChange={(items) =>
                              handleToggleCustomItem(items, section.key, "extraItems")
                            }
                          />
                        )}
                      </div>

                      <div className="mt-3 flex-1 border-t border-slate-100 dark:border-slate-800 pt-3 md:mt-0 md:border-0 md:pl-4 md:pr-4 md:pt-0">
                        <MobilePreview
                          quantity={Number(field.value) || 0}
                          isCustom={isCustom}
                          customItems={
                            (getValues(
                              `${mealPath}.${section.key}.customItems` as const
                            ) as string[]) || []
                          }
                          extraItems={
                            (getValues(
                              `${mealPath}.${section.key}.extraItems` as const
                            ) as string[]) || []
                          }
                          catalog={getSectionItems(section.source) as CatalogItem[]}
                          unitMode={watchedUnitMode || 1}
                          sectionLabel={section.short}
                        />
                      </div>
                    </div>
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
