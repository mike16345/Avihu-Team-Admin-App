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
import useMenuItemApi from "@/hooks/useMenuItemApi";
import DietaryTypeSelector from "../templates/dietTemplates/DietaryTypeSelector";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";

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

  const onSubmit = (values: z.infer<typeof menuItemSchema>) => {
    const menuItemObject = {
      ...values,
      foodGroup,
      dietaryType: dietaryTypes,
    };
    if (objectId) {
      editMenuItem(menuItemObject, objectId)
        .then(() => toast.success(`פריט עודכן בהצלחה!`))
        .then(() => closeSheet())
        .catch((err) =>
          toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
            description: err.response.data.message,
          })
        );
    } else {
      addMenuItem(menuItemObject)
        .then(() => toast.success(`פריט נשמר בהצלחה!`))
        .then(() => closeSheet())
        .catch((err) =>
          toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
            description: err.response.data.message,
          })
        );
    }
  };

  useEffect(() => {
    if (!objectId) return;
    getOneMenuItem(foodGroup, objectId)
      .then((res) => {
        setDietaryTypes(res.dietaryType);
        reset(res);
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
        <Button className="w-full" type="submit">
          שמור
        </Button>
      </form>
    </Form>
  );
};

export default MenuItemForm;
