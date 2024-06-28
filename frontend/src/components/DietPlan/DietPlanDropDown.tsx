import { FC, useState } from "react";
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
  onDelete: () => void;
  setDietPlan: (meal: IMeal) => void;
};

export const DietPlanDropDown: FC<DietPlanDropDownProps> = ({
  mealNumber,
  onDelete,
  setDietPlan,
}) => {
  const form = useForm<IMeal>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      totalProtein: { quantity: 1, unit: "grams", customInstructions: [] },
      totalCarbs: { quantity: 1, unit: "grams", customInstructions: [] },
      totalFats: { quantity: 0, unit: "grams", customInstructions: [] },
      totalVeggies: { quantity: 0, unit: "grams", customInstructions: [] },
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const [isOpen, setIsOpen] = useState(false);
  const [showCustomSelection, setShowCustomSelection] = useState<ShowCustomSelectionType>({
    totalProtein: false,
    totalCarbs: false,
    totalFats: false,
    totalVeggies: false,
  });

  const onSubmit = async (meal: IMeal) => {
    const newMeal = Object.keys(meal).reduce((acc, key) => {
      const accessKey = key as keyof IMeal;

      acc[accessKey] = {
        ...meal[accessKey],
        customInstructions: showCustomSelection[accessKey]
          ? meal[accessKey]?.customInstructions || []
          : [],
      };

      return acc;
    }, {} as IMeal);

    console.log("new meal", newMeal);
    setDietPlan(newMeal);
  };

  const handleToggleCustomItem = (selectedItems: string[], type: keyof IMeal) => {
    const item = form.getValues()[type];
    if (!item) return;
    const customInstructions = selectedItems.map((selectedItem) => {
      return { item: selectedItem, quantity: item.quantity };
    });

    form.setValue(type, { ...item, customInstructions: customInstructions });
  };

  const handleSetUnit = (unit: DietItemUnit, type: keyof IMeal) => {
    const itemToSet = form.getValues()[type];
    if (!itemToSet) return;

    form.setValue(type, { ...itemToSet, unit: unit });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2  ">
      <div className="flex items-center justify-between ">
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
            className={`w-9 p-0 transition ${isOpen ? "-rotate-180" : "rotate-0"}`}
          >
            <FaChevronDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CollapsibleContent className={`flex flex-col  gap-4 ${isOpen && "px-2 py-4"}`}>
            <FormField
              control={control}
              name="totalProtein.quantity"
              render={({ field }) => (
                <FormItem className="text-right font-bold">
                  <FormLabel className="text-right font-bold">כמות חלבון</FormLabel>
                  <FormControl>
                    <Input dir="rtl" type="number" {...field} />
                  </FormControl>
                  {errors.totalProtein?.quantity && (
                    <FormMessage>{errors.totalProtein.quantity.message}</FormMessage>
                  )}

                  <div className="flex items-center justify-between">
                    <CustomInstructionsRadio
                      onChangeSelection={(val: string) =>
                        setShowCustomSelection({
                          ...showCustomSelection,
                          totalProtein: val == "Custom",
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
            <FormField
              control={control}
              name="totalCarbs.quantity"
              render={({ field }) => (
                <FormItem className="text-right font-bold">
                  <FormLabel className="text-right font-bold">כמות פחמימות</FormLabel>
                  <FormControl>
                    <Input dir="rtl" type="number" {...field} />
                  </FormControl>
                  {errors.totalCarbs?.quantity && (
                    <FormMessage>{errors.totalCarbs.quantity.message}</FormMessage>
                  )}

                  <div className="flex items-center justify-between">
                    <CustomInstructionsRadio
                      onChangeSelection={(val: string) =>
                        setShowCustomSelection({
                          ...showCustomSelection,
                          totalCarbs: val == "Custom",
                        })
                      }
                    />
                    <DietItemUnitRadio
                      onChangeSelection={(val: DietItemUnit) => handleSetUnit(val, "totalProtein")}
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
                    <Input dir="rtl" type="number" {...field} />
                  </FormControl>
                  {errors.totalFats?.quantity && (
                    <FormMessage>{errors.totalFats.quantity.message}</FormMessage>
                  )}

                  {errors.totalFats?.unit && (
                    <FormMessage>{errors.totalFats.unit.message}</FormMessage>
                  )}
                  <CustomInstructionsRadio
                    onChangeSelection={(val: string) =>
                      setShowCustomSelection({ ...showCustomSelection, totalFats: val == "Custom" })
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
                    <Input dir="rtl" type="number" {...field} />
                  </FormControl>
                  {errors.totalVeggies?.quantity && (
                    <FormMessage>{errors.totalVeggies.quantity.message}</FormMessage>
                  )}
                  {errors.totalVeggies?.unit && (
                    <FormMessage>{errors.totalVeggies.unit.message}</FormMessage>
                  )}

                  <CustomInstructionsRadio
                    onChangeSelection={(val: string) =>
                      setShowCustomSelection({
                        ...showCustomSelection,
                        totalVeggies: val == "Custom",
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
            <div className="flex rtl:justify-end">
              <Button type="submit" className="mt-4 font-bold">
                שמור ארוחה
              </Button>
            </div>
          </CollapsibleContent>
        </form>
      </Form>
    </Collapsible>
  );
};
