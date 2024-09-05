import TemplateTabs from "@/components/templates/TemplateTabs";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import { IDietPlan, IMenuItem } from "@/interfaces/IDietPlan";
import React, { useEffect, useState } from "react";
import ErrorPage from "./ErrorPage";
import TemplateTabsSkeleton from "@/components/ui/skeletons/TemplateTabsSkeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { Item } from "@radix-ui/react-dropdown-menu";

const DietPlanTemplatePage = () => {
  const { getMenuItems, deleteMenuItem } = useMenuItemApi();
  /*  const { getAllDietPlanPresets, deleteDietPlanPreset } = useDietPlanPresetApi(); */

  const [dietPlanPresets, setDietPlanPresets] = useState<IDietPlan[]>([]);
  /*  const [proteinMenu, setProteinMenu] = useState<IMenuItem[]>([]);
  const [carbsMenu, setCarbsMenu] = useState<IMenuItem[]>([]);
  const [VegetableMenu, setVegetableMenu] = useState<IMenuItem[]>([]);
  const [fatsMenue, setFatsMenue] = useState<IMenuItem[]>([]); */

  const carbs = useQuery({
    queryKey: [`carbs`],
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: () => getMenuItems(`carbs`),
  });
  const protein = useQuery({
    queryKey: [`protein`],
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: () => getMenuItems(`protein`),
  });
  const fats = useQuery({
    queryKey: [`fats`],
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: () => getMenuItems(`fats`),
  });
  const vegetables = useQuery({
    queryKey: [`vegetables`],
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: () => getMenuItems(`vegetables`),
  });

  const queryClient = useQueryClient();

  const deletemenuItem = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`muscleGroups`] });
    },
  });

  const tabs: ITabs = {
    tabHeaders: [
      /* {
        name: `תפריטים`,
        value: `dietPlanPresets`,
      }, */
      {
        name: `חלבונים`,
        value: `proteinItems`,
      },
      {
        name: `פחמימות`,
        value: `carbItems`,
      },
      {
        name: `ירקות`,
        value: `vegetableItems`,
      },
      {
        name: `שומנים`,
        value: `fatsItems`,
      },
    ],
    tabContent: [
      /*  {
        value: `dietPlanPresets`,
        btnPrompt: `הוסף תפריט`,
        state: dietPlanPresets,
        setState: setDietPlanPresets,
        sheetForm: `dietPlans`,
        deleteFunc: deleteDietPlanPreset,
      }, */
      {
        value: `proteinItems`,
        btnPrompt: `הוסף חלבון`,
        state: protein.data?.data,
        sheetForm: `protein`,
        deleteFunc: deleteMenuItem,
      },
      {
        value: `carbItems`,
        btnPrompt: `הוסף פחמימה`,
        state: carbs.data?.data,
        sheetForm: `carbs`,
        deleteFunc: deleteMenuItem,
      },
      {
        value: `vegetableItems`,
        btnPrompt: `הוסף ירקות`,
        state: vegetables.data?.data,
        sheetForm: `vegetables`,
        deleteFunc: deleteMenuItem,
      },
      {
        value: `fatsItems`,
        btnPrompt: `הוסף שומנים`,
        state: fats.data?.data,
        sheetForm: `fats`,
        deleteFunc: deleteMenuItem,
      },
    ],
  };

  if (carbs.isLoading || protein.isLoading || vegetables.isLoading || fats.isLoading)
    return <TemplateTabsSkeleton />;
  if (carbs.isError || protein.isError || fats.isError || vegetables.isError)
    return (
      <ErrorPage
        message={
          carbs.error?.message ||
          protein.error?.message ||
          fats.error?.message ||
          vegetables.error?.message
        }
      />
    );

  return (
    <div>
      <h1 className="text-2xl pb-5">תפריטים</h1>
      <TemplateTabs tabs={tabs} />
    </div>
  );
};

export default DietPlanTemplatePage;
