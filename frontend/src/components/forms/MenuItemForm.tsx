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
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import MenuItemFormSkeleton from "../ui/skeletons/MenuItemFormSkeleton";
import { menuItemSchema } from "@/schemas/menuItemSchema";
import { convertStringsToOptions, servingTypeToString } from "@/lib/utils";
import CustomDropdownMenu from "../Dropdown/DropdownMenu";
import { Button } from "../ui/button";
import { MoreHorizontal, Plus, X } from "lucide-react";
import { IPresetFormProps } from "@/interfaces/interfaces";

interface MenuItemFormProps extends IPresetFormProps {
  foodGroup: string;
}

const selections = ["grams", "spoons", "cups", "pieces", "scoops", "teaSpoons", "units"];

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
    let currentSelections: string[] = [];

    for (const selection of selections) {
      let key = selection as keyof IServingItem;

      if (servingTypes[key] && servingTypes[key] > 0) {
        currentSelections.push(selection);
      }
    }
    // In case he wants to add another selection
    if (currentSelections.length == 1) {
      currentSelections.push(selections.filter((item) => item !== currentSelections[0])[0]);
    }
    if (currentSelections.length == 0) {
      currentSelections = ["grams", "spoons"];
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

  const handleRemoveOption = (index: number) => {
    if (showServingSelections.length <= 1) return;
    const removedKey = showServingSelections[index] as keyof IServingItem;
    const newArr = showServingSelections.filter((_, i) => i !== index);
    setShowServingSelections(newArr);
    menuItemForm.setValue(`oneServing.${removedKey}`, undefined);
  };

  const handleAddOption = () => {
    if (showServingSelections.length >= 2) return;
    const firstAvailable = selections.find((s) => !showServingSelections.includes(s));
    if (!firstAvailable) return;
    setShowServingSelections([...showServingSelections, firstAvailable]);
  };

  const onSubmit = (values: z.infer<typeof menuItemSchema>) => {
    let menuItemObject = {
      ...values,
      foodGroup,
      dietaryType: dietaryTypes,
      servingOrder: [...showServingSelections],
    };

    menuItemObject = cleanMenuItemObject(menuItemObject);
    menuItemObject.servingOrder = menuItemObject.servingOrder?.filter(
      (k) => (menuItemObject.oneServing as any)?.[k] > 0
    );

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

        <div className="grid grid-cols-2 gap-3">
          {showServingSelections.map((key, i) => {
            const typedKey = key as keyof IServingItem;
            const optionLabel = i === 0 ? "אופציה א'" : i === 1 ? "אופציה ב'" : "";
            const canRemove = showServingSelections.length > 1;

            return (
              <FormField
                key={key}
                control={menuItemForm.control}
                name={`oneServing.${typedKey}`}
                render={({ field }) => {
                  return (
                    <FormItem className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30">
                      {optionLabel && (
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {optionLabel}
                          </span>
                          {canRemove && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(i)}
                              className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                              title="הסר אופציה זו"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-1">
                        <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {servingTypeToString(key)} במנה
                        </FormLabel>
                        <CustomDropdownMenu
                          handleOptionClick={(val) => handleChangeServingSelection(val, key, i)}
                          options={availableSelections}
                          trigger={
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-slate-500 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-700"
                              title="שנה יחידת מידה"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />
                      </div>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          className="mt-1 h-9"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  );
                }}
              />
            );
          })}

          {showServingSelections.length < 2 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="group flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/40 p-3 text-slate-400 transition-all hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800/20 dark:text-slate-500 dark:hover:border-blue-700 dark:hover:bg-blue-950/20 dark:hover:text-blue-400"
              title="הוסף אופציה ב'"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/60 transition-colors group-hover:bg-blue-100 dark:bg-slate-700/60 dark:group-hover:bg-blue-900/40">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold">הוסף אופציה ב'</span>
            </button>
          )}
        </div>

        <DietaryTypeSelector
          saveSelected={(selectedItems) => setDietaryTypes(selectedItems)}
          existingItems={dietaryTypes}
        />
        <button
          type="submit"
          disabled={addNewMenuItem.isPending || updateMenuItem.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {addNewMenuItem.isPending || updateMenuItem.isPending ? "שומר…" : "שמור"}
        </button>
      </form>
    </Form>
  );
};

export default MenuItemForm;
