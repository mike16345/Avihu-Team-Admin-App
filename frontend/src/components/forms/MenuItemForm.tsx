import React, { useEffect, useMemo, useState } from "react";
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
import { IMenuItem, IServingItem } from "@/interfaces/IDietPlan";
import CustomButton from "../ui/CustomButton";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import MenuItemFormSkeleton from "../ui/skeletons/MenuItemFormSkeleton";
import { menuItemSchema } from "@/schemas/menuItemSchema";
import { convertStringsToOptions, servingTypeToString } from "@/lib/utils";
import CustomDropdownMenu from "../Dropdown/DropdownMenu";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";

interface MenuItemFormProps {
  objectId?: string;
  closeSheet: () => void;
  foodGroup: string;
}

const selections = ["grams", "spoons", "cups", "pieces", "scoops"];

const MenuItemForm: React.FC<MenuItemFormProps> = ({ objectId, closeSheet, foodGroup }) => {
  const { getOneMenuItem, addMenuItem, editMenuItem } = useMenuItemApi();
  const [dietaryTypes, setDietaryTypes] = useState<string[]>([]);
  const [showServingSelections, setShowServingSelections] = useState(["grams", "spoons"]);

  const availableSelections = useMemo(() => {
    const filteredItems = selections.filter((selection) => {
      return !showServingSelections.includes(selection);
    });

    return convertStringsToOptions(filteredItems, servingTypeToString);
  }, [showServingSelections]);

  const menuItemForm = useForm<z.infer<typeof menuItemSchema>>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      oneServing: {},
    },
  });

  const { reset } = menuItemForm;

  const queryClient = useQueryClient();

  const handleInitShowSelections = (servingTypes: IServingItem) => {
    let currentSelections = [];

    for (const selection of selections) {
      let key = selection as keyof IServingItem;

      if (servingTypes[key] && servingTypes[key] > 0) {
        currentSelections.push(selection);
      }
    }

    setShowServingSelections(currentSelections);
  };

  const handleGetMenuItem = async () => {
    if (!objectId) return;

    try {
      const res = await getOneMenuItem(foodGroup, objectId);

      setDietaryTypes(res.data.dietaryType);
      reset(res.data);
      handleInitShowSelections(res.data.oneServing);

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

  const cleanMenuItemObject = (menuItemObject: IMenuItem) => {
    const newMenuItemObject = { ...menuItemObject, oneServing: { ...menuItemObject.oneServing } };

    for (const key in newMenuItemObject.oneServing) {
      const typedKey = key as keyof IServingItem;

      if (!newMenuItemObject.oneServing[typedKey]) {
        delete newMenuItemObject.oneServing[typedKey];
      }
    }

    return newMenuItemObject;
  };

  const handleChangeServingSelection = (option: string, prevOption: string, index: number) => {
    const newArr = [...showServingSelections];
    const optionKey = option as keyof IServingItem;
    const prevOptionKey = prevOption as keyof IServingItem;
    const prevOptionValue = menuItemForm.getValues(`oneServing.${prevOptionKey}`);

    newArr[index] = option;
    setShowServingSelections(newArr);

    menuItemForm.setValue(`oneServing.${optionKey}`, prevOptionValue);
    menuItemForm.setValue(`oneServing.${prevOptionKey}`, undefined);
  };

  const onSubmit = (values: z.infer<typeof menuItemSchema>) => {
    let menuItemObject = {
      ...values,
      foodGroup,
      dietaryType: dietaryTypes,
    };
    menuItemObject = cleanMenuItemObject(menuItemObject);

    if (objectId) {
      updateMenuItem.mutate({ menuItemObject, objectId });
    } else {
      addNewMenuItem.mutate(menuItemObject);
    }
  };

  useEffect(() => {
    if (!data) return;

    setDietaryTypes(data.dietaryType);
    handleInitShowSelections(data.oneServing);
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

        <div className="grid grid-cols-2 gap-4">
          {showServingSelections.map((key, i) => {
            const typedKey = key as keyof IServingItem;

            return (
              <FormField
                key={key}
                control={menuItemForm.control}
                name={`oneServing.${typedKey}`}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>{servingTypeToString(key)} במנה</FormLabel>
                        <CustomDropdownMenu
                          handleOptionClick={(val) => handleChangeServingSelection(val, key, i)}
                          options={availableSelections}
                          trigger={
                            <Button type="button" variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            );
          })}
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
