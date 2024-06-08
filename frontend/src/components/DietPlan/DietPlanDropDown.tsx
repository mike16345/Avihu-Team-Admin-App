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
import { IMeal } from "@/interfaces/IDietPlan";

type DietPlanDropDownProps = {
  mealNumber: number;
  onDelete: () => void;
  setDietPlan: (meal: IMeal) => void;
};

const mealSchema = z.object({
  totalProtein: z.coerce.number().min(0, { message: "Protein must be 0 or more." }),
  totalCarbs: z.coerce.number().min(0, { message: "Carbs must be 0 or more." }),
  totalFats: z.coerce.number().min(0, { message: "Fats must be 0 or more." }).optional(),
  totalVeggies: z.coerce.number().min(0, { message: "Fats must be 0 or more." }).optional(),
});

export const DietPlanDropDown: FC<DietPlanDropDownProps> = ({
  mealNumber,
  onDelete,
  setDietPlan,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<IMeal>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      totalVeggies: 0,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = (values: z.infer<typeof mealSchema>) => {
    console.log("values", values);

    setDietPlan(values);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">Meal {mealNumber}</h4>
        <div>
          <Button onClick={() => onDelete()} variant="ghost" size="sm" className="w-9 p-0">
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
              name="totalProtein"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Protein</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    {errors.totalProtein && (
                      <FormMessage>{errors.totalProtein.message}</FormMessage>
                    )}
                    <CustomInstructionsRadio
                      onChangeSelection={(val: string) => console.log("val", val)}
                    />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={control}
              name="totalCarbs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carbs</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  {errors.totalCarbs && <FormMessage>{errors.totalCarbs.message}</FormMessage>}
                  <CustomInstructionsRadio
                    onChangeSelection={(val: string) => console.log("val", val)}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="totalFats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fats</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  {errors.totalFats && <FormMessage>{errors.totalFats.message}</FormMessage>}
                  <CustomInstructionsRadio
                    onChangeSelection={(val: string) => console.log("val", val)}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="totalVeggies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vegetables</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  {errors.totalVeggies && <FormMessage>{errors.totalVeggies.message}</FormMessage>}
                  <CustomInstructionsRadio
                    onChangeSelection={(val: string) => console.log("val", val)}
                  />
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
