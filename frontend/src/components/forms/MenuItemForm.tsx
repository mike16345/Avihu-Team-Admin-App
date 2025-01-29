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
import { IMenuItem } from "@/interfaces/IDietPlan";
import CustomButton from "../ui/CustomButton";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import MenuItemFormSkeleton from "../ui/skeletons/MenuItemFormSkeleton";
import { menuItemSchema } from "@/schemas/menuItemSchema";
import DeleteButton from "../workout plan/buttons/DeleteButton";
import { convertStringsToOptions, servingTypeToString } from "@/lib/utils";
import AddButton from "../workout plan/buttons/AddButton";
import CommandListDialog from "../Dialogs/CommandListDialog";

interface MenuItemFormProps {
  objectId?: string;
  closeSheet: () => void;
  foodGroup: string;
}

const MAX_SERVING_TYPES = 2;
const MIN_SERVING_TYPES = 1;

const MenuItemForm: React.FC<MenuItemFormProps> = ({ objectId, closeSheet, foodGroup }) => {
  const { getOneMenuItem, addMenuItem, editMenuItem } = useMenuItemApi();
  const [dietaryTypes, setDietaryTypes] = useState<string[]>([]);
  const [showServingSelections, setShowServingSelections] = useState({
    grams: true,
    spoons: true,
    scoops: false,
    pieces: false,
    cups: false,
  });

  const availableSelections = useMemo(() => {
    const filteredItems = Object.keys(showServingSelections)
      .map((val) => {
        if (!showServingSelections[val]) {
          return val;
        }
      })
      .filter((val) => val !== undefined);

    console.log("filteredItems", filteredItems);

    return convertStringsToOptions(filteredItems, servingTypeToString);
  }, [showServingSelections]);

  console.log("available", availableSelections);

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

  const cleanMenuItemObject = (menuItemObject: any) => {
    const newMenuItemObject = { ...menuItemObject, oneServing: { ...menuItemObject.oneServing } };

    for (const key in newMenuItemObject.oneServing) {
      if (!newMenuItemObject.oneServing[key]) {
        delete newMenuItemObject.oneServing[key];
      }
    }

    return newMenuItemObject;
  };

  const handleRemoveServingSelection = (type: string) => {
    const newObject = structuredClone({ ...showServingSelections, [type]: false });

    setShowServingSelections(newObject);
    menuItemForm.setValue(`oneServing.${type}`, undefined);
  };

  const handleAddServingSelection = (type: string) => {
    const newObject = structuredClone({ ...showServingSelections, [type]: true });

    setShowServingSelections(newObject);
    menuItemForm.setValue(`oneServing.${type}`, 0);
  };

  const onSubmit = (values: z.infer<typeof menuItemSchema>) => {
    let menuItemObject = {
      ...values,
      foodGroup,
      dietaryType: dietaryTypes,
    };

    console.log("menu item object before", menuItemObject);

    const servingTypesKeys = Object.keys(menuItemObject.oneServing);
    const isValidLength =
      servingTypesKeys.length <= MAX_SERVING_TYPES && servingTypesKeys.length > MIN_SERVING_TYPES;

    if (!isValidLength) {
      menuItemObject = cleanMenuItemObject(menuItemObject);
    }

    console.log("menu item object after", menuItemObject);

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

        <div className="grid grid-cols-2 gap-4">
          {Object.keys(showServingSelections)
            .filter((key) => showServingSelections[key])
            .map((key, index, arr) => (
              <FormField
                key={key}
                control={menuItemForm.control}
                name={`oneServing.${key}`}
                render={({ field }) => {
                  const isOnlyItemInCol = index == arr.length - 1 && arr.length % 2 == 1;

                  return (
                    <FormItem className={isOnlyItemInCol ? "col-span-2" : ""}>
                      <div className="flex items-center justify-between">
                        <FormLabel>{servingTypeToString(key)} במנה</FormLabel>
                        <DeleteButton
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveServingSelection(key);
                          }}
                          tip="מחק"
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
            ))}
        </div>

        {availableSelections.length > 0 && (
          <CommandListDialog
            title="בחר סוג למנה"
            handleChange={handleAddServingSelection}
            items={availableSelections}
            trigger={<AddButton tip="הוסף סוג" onClick={() => null} />}
          />
        )}

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
