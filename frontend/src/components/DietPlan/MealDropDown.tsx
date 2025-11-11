import { FC, useEffect, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FaChevronDown } from "react-icons/fa";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "../ui/input";
import { CustomItems, DietItemQuantityBlock, IDietPlan } from "@/interfaces/IDietPlan";
import { CustomItemSelection } from "./CustomItemSelection";
import ExtraItems from "./ExtraItems";
import DeleteButton from "../ui/buttons/DeleteButton";
import CustomRadioGroup from "../ui/CustomRadioGroup";

const dietRadioItems = [
  {
    id: "Custom",
    label: "בחירה",
    value: "Custom",
  },
  {
    label: "קבוע",
    id: "Fixed",
    value: "Fixed",
  },
];

const mealSections = [
  { key: "totalProtein", label: "כמות חלבון", source: "protein" },
  { key: "totalCarbs", label: "כמות פחמימות", source: "carbs" },
  { key: "totalFats", label: "כמות שומנים", source: "fats" },
  { key: "totalVeggies", label: "כמות ירקות", source: "veggies" },
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
): CustomValues => {
  return mealSections.reduce((acc, section) => {
    const block = meal?.[section.key] as DietItemQuantityBlock | undefined;
    const value = block?.[key];
    acc[section.key] = Array.isArray(value) ? value : [];
    return acc;
  }, createEmptyCustomValues());
};

const createEmptyShowState = (): ShowCustomSelectionType =>
  mealSections.reduce((acc, section) => {
    acc[section.key] = false;
    return acc;
  }, {} as ShowCustomSelectionType);

const extractShowCustomSelection = (meal: MealValue | undefined): ShowCustomSelectionType => {
  return mealSections.reduce((acc, section) => {
    const block = meal?.[section.key] as DietItemQuantityBlock | undefined;
    acc[section.key] = Boolean(block?.customItems?.length || block?.extraItems?.length);
    return acc;
  }, createEmptyShowState());
};

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

  useEffect(() => {
    setStoredCustomItems(initialCustomValues);
    setStoredExtraItems(initialExtraValues);
    setShowCustomSelection(initialShowState);
  }, [initialCustomValues, initialExtraValues, initialShowState]);

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

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="gap-2">
      <div className="flex items-center justify-between w-full">
        <h4 className="text-sm font-bold">ארוחה {mealNumber}</h4>
        <div className="flex items-center">
          <DeleteButton tip="הסר ארוחה" onClick={onDelete} />

          <Button
            onClick={() => setIsOpen((state) => !state)}
            variant="ghost"
            size="sm"
            className={`w-9 p-0 transition ${isOpen ? "rotate-180" : "rotate-0"}`}
          >
            <FaChevronDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </div>
      </div>

      <CollapsibleContent className={`flex flex-col gap-4 ${isOpen && "px-2 py-4"}`}>
        {mealSections.map((section) => {
          const quantityName = `meals.${mealIndex}.${section.key}.quantity` as const;
          const isCustom = showCustomSelection[section.key];

          return (
            <FormField
              key={section.key}
              control={control}
              name={quantityName}
              render={({ field }) => (
                <FormItem className="text-right font-bold">
                  <FormLabel className="text-right font-bold">{section.label}</FormLabel>
                  <FormControl>
                    <Input dir="rtl" type="number" {...field} />
                  </FormControl>
                  <FormMessage />

                  <div className="flex">
                    <CustomRadioGroup
                      className="flex items-center"
                      value={isCustom ? "Custom" : "Fixed"}
                      onValueChange={(val: ItemSelection) =>
                        handleChangeItemSelectionType(val, section.key)
                      }
                      items={dietRadioItems}
                    />
                  </div>
                  {isCustom && (
                    <div className="space-y-2">
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
                        existingItems={
                          (getValues(
                            `${mealPath}.${section.key}.extraItems` as const
                          ) as string[]) || []
                        }
                        onAddItem={(items) =>
                          handleToggleCustomItem(items, section.key, "extraItems")
                        }
                        trigger={
                          <Button variant={"secondary"} type="button">
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
      </CollapsibleContent>
    </Collapsible>
  );
};
