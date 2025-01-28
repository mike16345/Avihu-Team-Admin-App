import React, { useEffect, useLayoutEffect, useState } from "react";
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
import { toast } from "sonner";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import DietaryTypeSelector from "../templates/dietTemplates/DietaryTypeSelector";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IMenuItem } from "@/interfaces/IDietPlan";
import CustomButton from "../ui/CustomButton";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import MenuItemFormSkeleton from "../ui/skeletons/MenuItemFormSkeleton";

interface MenuItemFormProps {
  objectId?: string;
  closeSheet: () => void;
  foodGroup: string;
}

const MAX_SERVING_TYPES = 2;
const MIN_SERVING_TYPES = 1;

const servingItemSchema = z.object({
  spoons: z.coerce
    .number({ message: `שדה זה הינו שדה חובה` })
    .positive({ message: `אנא הכנס מספר הגבוה מ-0` })
    .optional(),
  grams: z.coerce
    .number({ message: `שדה זה הינו שדה חובה` })
    .positive({ message: `אנא הכנס מספר הגבוה מ-0` })
    .optional(),
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
      oneServing: {},
    },
  });

  const { reset } = menuItemForm;

  const queryClient = useQueryClient();
  const handleGetMenuItem = async () => {
    if (!objectId) return;

    try {
      const res = await getOneMenuItem(foodGroup, objectId);
      setDietaryTypes(res.data.dietaryType);
      reset(res.data);

      return res.data;
    } catch (error: any) {
      throw error;
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: [objectId],
    queryFn: () => handleGetMenuItem(),
    enabled: !!objectId,
    staleTime: FULL_DAY_STALE_TIME,
  });

  const successFunc = () => {
    Promise.all([
      queryClient.invalidateQueries({ queryKey: [foodGroup] }),
      queryClient.invalidateQueries({ queryKey: [objectId] }),
    ]);

    toast.success(`פריט נשמר בהצלחה!`);
    closeSheet();
  };

  const errFunc = (e: any) => {
    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: e.data.message,
    });
  };

  const updateMenuItem = useMutation({
    mutationFn: ({ objectId, menuItemObject }: { objectId: string; menuItemObject: IMenuItem }) =>
      editMenuItem(menuItemObject, objectId),
    onSuccess: successFunc,
    onError: errFunc,
  });

  const addNewMenuItem = useMutation({
    mutationFn: addMenuItem,
    onSuccess: successFunc,
    onError: errFunc,
  });

  const onSubmit = (values: z.infer<typeof menuItemSchema>) => {
    const menuItemObject = {
      ...values,
      foodGroup,
      dietaryType: dietaryTypes,
    };

    const servingTypesKeys = Object.keys(menuItemObject.oneServing);

    if (servingTypesKeys.length > MAX_SERVING_TYPES) {
      servingTypesKeys.forEach((key) => {
        let keyType = key as keyof typeof menuItemObject.oneServing;

        if (menuItemObject.oneServing[keyType] == 0) {
          delete menuItemObject.oneServing[keyType];
        }
      });
    }

    if (servingTypesKeys.length <= MAX_SERVING_TYPES) {
      if (objectId) {
        updateMenuItem.mutate({ menuItemObject, objectId });
      } else {
        addNewMenuItem.mutate(menuItemObject);
      }
    }
    if (objectId) {
      updateMenuItem.mutate({ menuItemObject, objectId });
    } else {
      addNewMenuItem.mutate(menuItemObject);
    }
  };

  useEffect(() => {
    if (!data) return;

    setDietaryTypes(data.dietaryType);
    reset(data);
  }, []);

  if (isLoading) return <MenuItemFormSkeleton />;

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
                <Input placeholder="הכנס פריט כאן..." min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-center gap-5">
          <FormField
            control={menuItemForm.control}
            name="oneServing.grams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>גרם במנה</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="80g" min={0} {...field} />
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
        <div className="flex items-center justify-center gap-5">
          <FormField
            control={menuItemForm.control}
            name="oneServing.grams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>גרם במנה</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="80g" min={0} {...field} />
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
          variant={"success"}
          className="w-full h-auto"
          isLoading={addNewMenuItem.isPending || updateMenuItem.isPending}
        />
      </form>
    </Form>
  );
};

export default MenuItemForm;
