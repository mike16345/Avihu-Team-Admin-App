import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const mealSchema = z.object({
  totalProtein: z.object({
    quantity: z.coerce.number().min(0, { message: "Protein must be 0 or more." }),
    unit: z.enum(["grams", "spoons"]),
  }),
  totalCarbs: z.object({
    quantity: z.coerce.number().min(0, { message: "Carbs must be 0 or more." }),
    unit: z.enum(["grams", "spoons"]),
  }),
  totalFats: z
    .object({
      quantity: z.coerce.number().min(0, { message: "Fats must be 0 or more." }),
      unit: z.enum(["grams", "spoons"]),
    })
    .optional(),
  totalVeggies: z
    .object({
      quantity: z.coerce.number().min(0, { message: "Veggies must be 0 or more." }),
      unit: z.enum(["grams", "spoons"]),
    })
    .optional(),
});

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
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomProtein, setShowCustomProtein] = useState(false);
  const [showCustomCarbs, setShowCustomCarbs] = useState(false);
  const [showCustomFats, setShowCustomFats] = useState(false);
  const [showCustomVeggies, setShowCustomVeggies] = useState(false);

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

  const onSubmit = async (values: IMeal) => {
    console.log("values", values);
    setDietPlan(values);
  };

  const handleToggleCustomItem = (selectedItems: string[], type: keyof IMeal) => {
    const item = form.getValues()[type];
    if (!item) return;
    const customInstructions = selectedItems.map((selectedItem) => {
      return { item: selectedItem, quantity: item.quantity };
    });

    form.setValue(type, { ...item, customInstructions: customInstructions });
    console.log("form", form.getValues());
  };

  const handleSetUnit = (unit: DietItemUnit, type: keyof IMeal) => {
    const itemToSet = form.getValues()[type];
    if (!itemToSet) return;

    form.setValue(type, { ...itemToSet, unit: unit });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">Meal {mealNumber}</h4>
        <div>
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
          <CollapsibleContent className={`flex flex-col gap-4 ${isOpen && "p-4"}`}>
            <FormField
              control={control}
              name="totalProtein.quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protein Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  {errors.totalProtein?.quantity && (
                    <FormMessage>{errors.totalProtein.quantity.message}</FormMessage>
                  )}

                  <div className="flex items-center justify-between">
                    <CustomInstructionsRadio
                      onChangeSelection={(val: string) => setShowCustomProtein(val === "Custom")}
                    />
                    <DietItemUnitRadio
                      onChangeSelection={(val: DietItemUnit) => handleSetUnit(val, "totalProtein")}
                    />
                  </div>
                  {showCustomProtein && (
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
                <FormItem>
                  <FormLabel>Carbs Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  {errors.totalCarbs?.quantity && (
                    <FormMessage>{errors.totalCarbs.quantity.message}</FormMessage>
                  )}

                  <div className="flex items-center justify-between">
                    <CustomInstructionsRadio
                      onChangeSelection={(val: string) => setShowCustomCarbs(val === "Custom")}
                    />
                    <DietItemUnitRadio
                      onChangeSelection={(val: DietItemUnit) => handleSetUnit(val, "totalProtein")}
                    />
                  </div>

                  {showCustomCarbs && (
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
                <FormItem>
                  <FormLabel>Fats Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  {errors.totalFats?.quantity && (
                    <FormMessage>{errors.totalFats.quantity.message}</FormMessage>
                  )}

                  {errors.totalFats?.unit && (
                    <FormMessage>{errors.totalFats.unit.message}</FormMessage>
                  )}
                  <CustomInstructionsRadio
                    onChangeSelection={(val: string) => setShowCustomFats(val === "Custom")}
                  />
                  {showCustomFats && (
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
                <FormItem>
                  <FormLabel>Vegetables Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  {errors.totalVeggies?.quantity && (
                    <FormMessage>{errors.totalVeggies.quantity.message}</FormMessage>
                  )}
                  {errors.totalVeggies?.unit && (
                    <FormMessage>{errors.totalVeggies.unit.message}</FormMessage>
                  )}

                  <CustomInstructionsRadio
                    onChangeSelection={(val: string) => setShowCustomVeggies(val === "Custom")}
                  />

                  {showCustomVeggies && (
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
          <Button type="submit" className="mt-4">
            Save Meal
          </Button>
        </form>
      </Form>
    </Collapsible>
  );
};
