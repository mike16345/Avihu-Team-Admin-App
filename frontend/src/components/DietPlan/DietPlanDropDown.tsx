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
import {
  CustomInstructions,
  DietItemUnit,
  ICustomCarbsInstructions,
  ICustomFatsInstructions,
  ICustomProteinInstructions,
  ICustomVeggiesInstructions,
  IMeal,
} from "@/interfaces/IDietPlan";
import { CustomItemSelection } from "./CustomItemSelection";
import { DietItemUnitRadio } from "./DietItemUnitRadio";

type DietPlanDropDownProps = {
  mealNumber: number;
  onDelete: () => void;
  setDietPlan: (meal: IMeal) => void;
};

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

  customProteinInstructions: z.array(
    z.object({
      item: z.string(),
      quantity: z.coerce.number().min(0, { message: "Protein must be 0 or more." }),
      unit: z.enum(["grams", "spoons"]),
    })
  ),
  customCarbsInstructions: z.array(
    z.object({
      item: z.string(),
      quantity: z.coerce.number().min(0, { message: "Carbs must be 0 or more." }),
      unit: z.enum(["grams", "spoons"]),
    })
  ),
  customFatsInstructions: z.array(
    z.object({
      item: z.string(),
      quantity: z.coerce.number().min(0, { message: "Fats must be 0 or more." }),
      unit: z.enum(["grams", "spoons"]),
    })
  ),
});

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
      totalProtein: { quantity: 0, unit: "grams" },
      totalCarbs: { quantity: 0, unit: "grams" },
      totalFats: { quantity: 0, unit: "grams" },
      totalVeggies: { quantity: 0, unit: "grams" },
      customProteinInstructions: [],
      customCarbsInstructions: [],
      customFatsInstructions: [],
      customVeggiesInstructions: [],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = (values: IMeal) => {
    console.log("values", values);
    setDietPlan(values);
  };

  const handleToggleCustomItem = (selectedItems: string[], type: CustomInstructions) => {
    var selected;
    switch (type) {
      case "customCarbsInstructions":
        const carbs = form.getValues().totalCarbs;
        selected = selectedItems.map((item) => {
          return {
            item: item,
            quantity: carbs.quantity,
            unit: carbs.unit,
          } as ICustomCarbsInstructions;
        });
        break;
      case "customFatsInstructions":
        const fats = form.getValues().totalFats;
        selected = selectedItems.map((item) => {
          return {
            item: item,
            quantity: fats?.quantity || 1,
            unit: fats?.unit || "grams",
          } as ICustomFatsInstructions;
        });
        break;
      case "customProteinInstructions":
        const { quantity, unit } = form.getValues().totalProtein;
        selected = selectedItems.map((item) => {
          return { item: item, quantity: quantity, unit: unit } as ICustomProteinInstructions;
        });
        break;
      case "customVeggiesInstructions":
        const veggies = form.getValues().totalVeggies;
        selected = selectedItems.map((item) => {
          return {
            item: item,
            quantity: veggies?.quantity || 1,
            unit: veggies?.unit || "grams",
          } as ICustomVeggiesInstructions;
        });
        break;
      default:
        break;
    }

    form.setValue(type, selected);
    console.log("setting value", type, selected);
    console.log("form", form.getValues());
  };

  const handleSetUnit = (unit: DietItemUnit, type: keyof IMeal) => {
    // TODO: Fix the set value to item. 
    form.setValue(type, { ...form.getValues()[type], unit });
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
                      onItemToggle={(selectedItems) =>
                        handleToggleCustomItem(selectedItems, "customProteinInstructions")
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
                      onChangeSelection={(val: DietItemUnit) => console.log("val", val)}
                    />
                  </div>

                  {showCustomCarbs && (
                    <CustomItemSelection
                      onItemToggle={(selectedItems) =>
                        handleToggleCustomItem(selectedItems, "customCarbsInstructions")
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
                      onItemToggle={(selectedItems) =>
                        handleToggleCustomItem(selectedItems, "customFatsInstructions")
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
                      onItemToggle={(selectedItems) =>
                        handleToggleCustomItem(selectedItems, "customVeggiesInstructions")
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
