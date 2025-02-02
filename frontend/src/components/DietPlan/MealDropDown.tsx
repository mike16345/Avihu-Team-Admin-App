import { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaChevronDown, FaTrash } from "react-icons/fa";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { CustomItemSelectionRadio } from "./CustomItemSelectionRadio";
import { CustomItems, DietItemUnit, IDietItem, IMeal } from "@/interfaces/IDietPlan";
import { CustomItemSelection } from "./CustomItemSelection";
import { DietItemUnitRadio } from "./DietItemUnitRadio";
import { mealSchema } from "./DietPlanSchema";
import ExtraItems from "./ExtraItems";

type ShowCustomSelectionType = {
  totalProtein: boolean;
  totalCarbs: boolean;
};

type CustomValues = {
  totalProtein: string[];
  totalCarbs: string[];
};

type MealDropDownProps = {
  mealNumber: number;
  meal: IMeal;
  customItems: CustomItems;
  onDelete: () => void;
  setDietPlan: (meal: IMeal) => void;
};
type ItemSelection = "Custom" | "Fixed";
type OmittedIMeal = Omit<IMeal, "_id">;

export const MealDropDown: FC<MealDropDownProps> = ({
  mealNumber,
  meal,
  customItems,
  onDelete,
  setDietPlan,
}) => {
  const initialFormValues = useMemo(() => {
    return meal;
  }, [meal]);

  const [initialCustomItems, setInitialCustomItems] = useState<CustomValues>({
    totalProtein: meal.totalProtein.customItems || [],
    totalCarbs: meal.totalCarbs.customItems || [],
  });

  const [initialExtraItems, setInitialExtraItems] = useState<CustomValues>({
    totalProtein: meal.totalProtein.extraItems || [],
    totalCarbs: meal.totalCarbs.extraItems || [],
  });

  const form = useForm<OmittedIMeal>({
    resolver: zodResolver(mealSchema),
    values: initialFormValues,
    mode: "onBlur",
  });

  const {
    control,
    setValue,
    formState: { errors },
  } = form;

  const [isOpen, setIsOpen] = useState(false);

  const initialShowCustomSelection = useMemo(() => {
    const showProtein =
      !!meal.totalProtein.customItems?.length || !!meal.totalProtein.extraItems?.length;
    const showCarbs = !!meal.totalCarbs.customItems?.length || !!meal.totalCarbs.extraItems?.length;

    return {
      totalProtein: showProtein,
      totalCarbs: showCarbs,
    };
  }, [meal]);

  const [showCustomSelection, setShowCustomSelection] = useState<ShowCustomSelectionType>(
    initialShowCustomSelection
  );

  const handleInputChange = (field: keyof OmittedIMeal, value: any) => {
    const updatedMeal = {
      ...form.getValues(),
      [field]: { ...form.getValues()[field], quantity: value },
    };
    setDietPlan(updatedMeal);
  };

  const handleToggleCustomItem = (
    selectedItems: string[],
    type: keyof OmittedIMeal,
    key: keyof IDietItem
  ) => {
    const item = form.getValues()[type];
    if (!item) return;

    if (key == "customItems") {
      setInitialCustomItems((prev) => {
        return {
          ...prev,
          [type]: selectedItems,
        };
      });
    } else if (key == "extraItems") {
      setInitialExtraItems((prev) => {
        return {
          ...prev,
          [type]: selectedItems,
        };
      });
    }

    setValue(type, { ...item, [key]: selectedItems });
    handleInputChange(type, item.quantity);
  };

  const handleChangeItemSelectionType = (
    type: ItemSelection,
    field: keyof ShowCustomSelectionType
  ) => {
    const item = form.getValues()[field];
    let meal: OmittedIMeal = {
      ...form.getValues(),
    };

    setShowCustomSelection((prev) => ({ ...prev, [field]: type == "Custom" }));

    if (type == "Custom") {
      const val = {
        ...item,
        customItems: initialCustomItems[field],
        extraItems: initialExtraItems[field],
      };

      setValue(field, {
        ...item,
        ...val,
      });
      meal = { ...meal, [field]: val };
    } else {
      const val = {
        ...item,
        customItems: [],
        extraItems: [],
      };

      setValue(field, { ...item, ...val });
      meal = { ...meal, [field]: val };
    }
    setDietPlan(meal);
  };

  useEffect(() => {
    form.trigger();
  }, []);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="gap-2">
      <div className="flex items-center justify-between w-full">
        <h4 className="text-sm font-bold">ארוחה {mealNumber}</h4>
        <div className="flex items-center">
          <Button onClick={onDelete} variant="ghost" size="sm" className="w-9 p-0">
            <FaTrash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>

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
      <Form {...form}>
        <form>
          <CollapsibleContent className={`flex flex-col gap-4 ${isOpen && "px-2 py-4"}`}>
            <FormField
              control={control}
              name="totalProtein.quantity"
              render={({ field }) => (
                <FormItem className="text-right font-bold">
                  <FormLabel className="text-right font-bold">כמות חלבון</FormLabel>
                  <FormControl>
                    <Input
                      dir="rtl"
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("totalProtein", e.target.value);
                      }}
                    />
                  </FormControl>
                  {errors.totalProtein?.quantity && (
                    <FormMessage>{errors.totalProtein.quantity.message}</FormMessage>
                  )}

                  <div className="flex">
                    <CustomItemSelectionRadio
                      defaultValue={showCustomSelection.totalProtein ? "Custom" : "Fixed"}
                      onChangeSelection={(val: ItemSelection) =>
                        handleChangeItemSelectionType(val, "totalProtein")
                      }
                    />
                  </div>
                  {showCustomSelection.totalProtein && (
                    <div className="space-y-2">
                      <CustomItemSelection
                        items={customItems.protein}
                        selectedItems={form?.getValues("totalProtein.customItems")}
                        onItemToggle={(selectedItems) =>
                          handleToggleCustomItem(selectedItems, "totalProtein", "customItems")
                        }
                      />
                      <ExtraItems
                        existingItems={form?.getValues("totalProtein.extraItems")}
                        onAddItem={(items) =>
                          handleToggleCustomItem(items, "totalProtein", "extraItems")
                        }
                        trigger={<Button type="button">פריטים נוספים</Button>}
                      />
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="totalCarbs.quantity"
              render={({ field }) => (
                <FormItem className="text-right font-bold">
                  <FormLabel className="text-right font-bold">כמות פחמימות</FormLabel>
                  <FormControl>
                    <Input
                      dir="rtl"
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("totalCarbs", e.target.value);
                      }}
                    />
                  </FormControl>
                  {errors.totalCarbs?.quantity && (
                    <FormMessage>{errors.totalCarbs.quantity.message}</FormMessage>
                  )}

                  <div className="flex ">
                    <CustomItemSelectionRadio
                      defaultValue={showCustomSelection.totalCarbs ? "Custom" : "Fixed"}
                      onChangeSelection={(val: ItemSelection) =>
                        handleChangeItemSelectionType(val, "totalCarbs")
                      }
                    />
                  </div>

                  {showCustomSelection.totalCarbs && (
                    <div className="space-y-2">
                      <CustomItemSelection
                        items={customItems.carbs}
                        selectedItems={form?.getValues("totalCarbs.customItems")}
                        onItemToggle={(selectedItems) =>
                          handleToggleCustomItem(selectedItems, "totalCarbs", "customItems")
                        }
                      />
                      <ExtraItems
                        existingItems={form.getValues("totalCarbs.extraItems")}
                        onAddItem={(items) =>
                          handleToggleCustomItem(items, "totalCarbs", "extraItems")
                        }
                        trigger={<Button type="button">פריטים נוספים</Button>}
                      />
                    </div>
                  )}
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </form>
      </Form>
    </Collapsible>
  );
};
