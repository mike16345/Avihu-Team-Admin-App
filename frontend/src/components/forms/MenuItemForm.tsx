import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import DietaryTypeSelector from "../templates/dietTemplates/DietaryTypeSelector";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IMenuItem } from "@/interfaces/IDietPlan";
import CustomButton from "../ui/CustomButton";

interface MenuItemFormProps {
  objectId?: string;
  closeSheet: () => void;
  foodGroup: string;
}

const servingItemSchema = z.object({
  spoons: z.coerce
    .number({ message: `שדה זה הינו שדה חובה` })
    .positive({ message: `אנא הכנס מספר הגבוה מ-0` }),
  grams: z.coerce
    .number({ message: `שדה זה הינו שדה חובה` })
    .positive({ message: `אנא הכנס מספר הגבוה מ-0` }),
});

const menuItemSchema = z.object({
  name: z.string().min(1, { message: `חובה לתת לפריט שם` }),
  oneServing: servingItemSchema,
});

const MenuItemForm: React.FC<MenuItemFormProps> = ({ objectId, closeSheet, foodGroup }) => {
  const { getOneMenuItem, addMenuItem, editMenuItem } = useMenuItemApi();
  const [dietaryTypes, setDietaryTypes] = useState<string[]>([]);

  const menuItemForm = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      oneServing: {
        spoons: 0,
        grams: 0,
      },
    },
  });

  const { reset } = menuItemForm;

  const queryClient = useQueryClient();

  const updateMenuItem = useMutation({
    mutationFn: ({ objectId, menuItemObject }: { objectId: string; menuItemObject: IMenuItem }) =>
      editMenuItem(menuItemObject, objectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [foodGroup] });
    },
  });
  const addNewMenuItem = useMutation({
    mutationFn: addMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [foodGroup] });
    },
  });

  const onSubmit = (values: z.infer<typeof menuItemSchema>) => {
    const menuItemObject = {
      ...values,
      foodGroup,
      dietaryType: dietaryTypes,
    };
    if (objectId) {
      updateMenuItem.mutate({ menuItemObject, objectId });
      if (updateMenuItem.isError) {
        return toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
          description: updateMenuItem.error.message,
        });
      }
      toast.success(`פריט עודכן בהצלחה!`);
      closeSheet();
    } else {
      addNewMenuItem.mutate(menuItemObject);
      if (addNewMenuItem.isError) {
        return toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
          description: addNewMenuItem.error.message,
        });
      }
      toast.success(`פריט נשמר בהצלחה!`);
      closeSheet();
    }
  };

  useEffect(() => {
    if (!objectId) return;
    getOneMenuItem(foodGroup, objectId)
      .then((res) => {
        setDietaryTypes(res.data.dietaryType);
        reset(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <Form {...menuItemForm}>
      <form onSubmit={menuItemForm.handleSubmit(onSubmit)} className="space-y-4 text-right">
        <FormField
          control={menuItemForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם פריט</FormLabel>
              <FormControl>
                <Input placeholder="הכנס פריט כאן..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-5">
          <FormField
            control={menuItemForm.control}
            name="oneServing.grams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>גרם במנה</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="80g" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={menuItemForm.control}
            name="oneServing.spoons"
            render={({ field }) => (
              <FormItem>
                <FormLabel>כפות במנה</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DietaryTypeSelector
          saveSelected={(selectedItems) => setDietaryTypes(selectedItems)}
          existingItems={dietaryTypes}
        />
        <CustomButton
          title="שמור"
          type="submit"
          className="w-full h-auto"
          isLoading={addNewMenuItem.isPending || updateMenuItem.isPending}
        />
      </form>
    </Form>
  );
};

export default MenuItemForm;
