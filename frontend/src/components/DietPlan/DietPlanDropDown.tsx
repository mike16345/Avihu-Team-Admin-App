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
import { CustomItems, DietItemUnit, IMeal } from "@/interfaces/IDietPlan";
import { CustomItemSelection } from "./CustomItemSelection";
import { DietItemUnitRadio } from "./DietItemUnitRadio";
import { mealSchema } from "./DietPlanSchema";

type ShowCustomSelectionType = {
  totalProtein: boolean;
  totalCarbs: boolean;
  totalFats: boolean;
  totalVeggies: boolean;
};

type DietPlanDropDownProps = {
  mealNumber: number;
  meal: IMeal;
  customItems: CustomItems;
  onDelete: () => void;
  setDietPlan: (meal: IMeal) => void;
};

type OmittedIMeal = Omit<IMeal, "_id">;

export const DietPlanDropDown: FC<DietPlanDropDownProps> = ({
  mealNumber,
  meal,
  customItems,
  onDelete,
  setDietPlan,
}) => {
  const initialFormValues = useMemo(() => {
    return meal;
  }, [meal]);

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
    const showProtein = !!meal.totalProtein.customItems?.length;
    const showCarbs = !!meal.totalCarbs.customItems?.length;

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

  const handleToggleCustomItem = (selectedItems: string[], type: keyof OmittedIMeal) => {
    const item = form.getValues()[type];
    if (!item) return;

    setValue(type, { ...item, customItems: selectedItems });
    handleInputChange(type, item.quantity);
  };

  const handleSetUnit = (unit: DietItemUnit, type: keyof OmittedIMeal) => {
    const itemToSet = form.getValues()[type];
    if (!itemToSet) return;

    setValue(type, { ...itemToSet, unit: unit });
    handleInputChange(type, itemToSet.quantity);
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

                  <div className="flex items-center justify-between">
                    <CustomItemSelectionRadio
                      defaultValue={showCustomSelection.totalProtein ? "Custom" : "Fixed"}
                      onChangeSelection={(val: string) =>
                        setShowCustomSelection({
                          ...showCustomSelection,
                          totalProtein: val === "Custom",
                        })
                      }
                    />
                    <DietItemUnitRadio
                      onChangeSelection={(val: DietItemUnit) => handleSetUnit(val, "totalProtein")}
                    />
                  </div>
                  {showCustomSelection.totalProtein && (
                    <CustomItemSelection
                      items={customItems.protein}
                      selectedItems={form?.getValues("totalProtein.customItems")?.map((s) => s._id)}
                      onItemToggle={(selectedItems) =>
                        handleToggleCustomItem(selectedItems, "totalProtein")
                      }
                    />
                  )}
                </FormItem>
              )}
            />

            {/* Similar logic for other fields, such as totalCarbs, totalFats, and totalVeggies */}
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

                  <div className="flex items-center justify-between">
                    <CustomItemSelectionRadio
                      defaultValue={showCustomSelection.totalCarbs ? "Custom" : "Fixed"}
                      onChangeSelection={(val: string) =>
                        setShowCustomSelection({
                          ...showCustomSelection,
                          totalCarbs: val === "Custom",
                        })
                      }
                    />
                    <DietItemUnitRadio
                      onChangeSelection={(val: DietItemUnit) => handleSetUnit(val, "totalCarbs")}
                    />
                  </div>

                  {showCustomSelection.totalCarbs && (
                    <CustomItemSelection
                      items={customItems.carbs}
                      selectedItems={form?.getValues("totalCarbs.customItems")?.map((s) => s._id)}
                      onItemToggle={(selectedItems) =>
                        handleToggleCustomItem(selectedItems, "totalCarbs")
                      }
                    />
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
