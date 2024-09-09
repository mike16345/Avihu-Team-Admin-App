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
import { CustomInstructionsRadio } from "./CustomInstructionsRadio";
import { DietItemUnit, IMeal } from "@/interfaces/IDietPlan";
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
  onDelete: () => void;
  setDietPlan: (meal: IMeal) => void;
};

type OmittedIMeal = Omit<IMeal, "_id">;

export const DietPlanDropDown: FC<DietPlanDropDownProps> = ({
  mealNumber,
  meal,
  onDelete,
  setDietPlan,
}) => {
  const initialFormValues = useMemo(() => {
    delete meal._id;
    return meal;
  }, [meal]);

  const form = useForm<OmittedIMeal>({
    resolver: zodResolver(mealSchema),
    values: initialFormValues,
    mode: "onTouched",
  });

  const {
    control,
    setValue,
    formState: { errors },
  } = form;

  console.log("errors", errors);

  const [isOpen, setIsOpen] = useState(false);

  const initialShowCustomSelection = useMemo(() => {
    const showProtein = !!meal.totalProtein.customInstructions?.length;
    const showCarbs = !!meal.totalCarbs.customInstructions?.length;
    const showFats = !!meal?.totalFats?.customInstructions?.length;
    const showVeggies = !!meal?.totalVeggies?.customInstructions?.length;

    return {
      totalProtein: showProtein,
      totalCarbs: showCarbs,
      totalFats: showFats,
      totalVeggies: showVeggies,
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
    const customInstructions = selectedItems.map((selectedItem) => {
      return { item: selectedItem, quantity: item.quantity };
    });

    setValue(type, { ...item, customInstructions: customInstructions });
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full gap-2">
      <div className="flex items-center justify-between">
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
                    <CustomInstructionsRadio
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
                      selectedItems={form
                        ?.getValues("totalProtein.customInstructions")
                        ?.map((s) => s.item)}
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
                    <CustomInstructionsRadio
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
                      selectedItems={form
                        ?.getValues("totalCarbs.customInstructions")
                        ?.map((s) => s.item)}
                      onItemToggle={(selectedItems) =>
                        handleToggleCustomItem(selectedItems, "totalCarbs")
                      }
                    />
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="totalFats.quantity"
              render={({ field }) => (
                <FormItem className="text-right font-bold">
                  <FormLabel className="text-right font-bold">כמות שומנים</FormLabel>
                  <FormControl>
                    <Input
                      dir="rtl"
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("totalFats", e.target.value);
                      }}
                    />
                  </FormControl>
                  {errors.totalFats?.quantity && (
                    <FormMessage>{errors.totalFats.quantity.message}</FormMessage>
                  )}

                  <CustomInstructionsRadio
                    defaultValue={showCustomSelection.totalFats ? "Custom" : "Fixed"}
                    onChangeSelection={(val: string) =>
                      setShowCustomSelection({
                        ...showCustomSelection,
                        totalFats: val === "Custom",
                      })
                    }
                  />
                  {showCustomSelection.totalFats && (
                    <CustomItemSelection
                      selectedItems={form
                        ?.getValues("totalFats.customInstructions")
                        ?.map((s) => s.item)}
                      onItemToggle={(selectedItems) =>
                        handleToggleCustomItem(selectedItems, "totalFats")
                      }
                    />
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="totalVeggies.quantity"
              render={({ field }) => (
                <FormItem className="text-right font-bold">
                  <FormLabel className="text-right font-bold">כמות ירקות</FormLabel>
                  <FormControl>
                    <Input
                      dir="rtl"
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange("totalVeggies", e.target.value);
                      }}
                    />
                  </FormControl>
                  {errors.totalVeggies?.quantity && (
                    <FormMessage>{errors.totalVeggies.quantity.message}</FormMessage>
                  )}

                  <CustomInstructionsRadio
                    defaultValue={showCustomSelection.totalVeggies ? "Custom" : "Fixed"}
                    onChangeSelection={(val: string) =>
                      setShowCustomSelection({
                        ...showCustomSelection,
                        totalVeggies: val === "Custom",
                      })
                    }
                  />
                  {showCustomSelection.totalVeggies && (
                    <CustomItemSelection
                      selectedItems={form
                        ?.getValues("totalVeggies.customInstructions")
                        ?.map((s) => s.item)}
                      onItemToggle={(selectedItems) =>
                        handleToggleCustomItem(selectedItems, "totalVeggies")
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
