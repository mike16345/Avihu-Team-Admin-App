import TemplateTabs from "@/components/templates/TemplateTabs";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import React from "react";
import ErrorPage from "./ErrorPage";
import TemplateTabsSkeleton from "@/components/ui/skeletons/TemplateTabsSkeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ITabs } from "@/interfaces/interfaces";

const DietPlanTemplatePage = () => {
  const { getMenuItems, deleteMenuItem } = useMenuItemApi();
  /*  const { getAllDietPlanPresets, deleteDietPlanPreset } = useDietPlanPresetApi(); */

  /* const [dietPlanPresets, setDietPlanPresets] = useState<IDietPlan[]>([]); */

  const carbs = useQuery({
    queryKey: [`carbs`],
    staleTime: Infinity,
    queryFn: () => getMenuItems(`carbs`),
  });
  const protein = useQuery({
    queryKey: [`protein`],
    staleTime: Infinity,
    queryFn: () => getMenuItems(`protein`),
  });
  const fats = useQuery({
    queryKey: [`fats`],
    staleTime: Infinity,
    queryFn: () => getMenuItems(`fats`),
  });
  const vegetables = useQuery({
    queryKey: [`vegetables`],
    staleTime: Infinity,
    queryFn: () => getMenuItems(`vegetables`),
  });

  const queryClient = useQueryClient();

  const deleteCarbs = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`carbs`] });
    },
  });
  const deleteFats = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`fats`] });
    },
  });
  const deleteVegetables = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`vegetables`] });
    },
  });
  const deleteProteins = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`protein`] });
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
        deleteFunc: deleteProteins,
      },
      {
        value: `carbItems`,
        btnPrompt: `הוסף פחמימה`,
        state: carbs.data?.data,
        sheetForm: `carbs`,
        deleteFunc: deleteCarbs,
      },
      {
        value: `vegetableItems`,
        btnPrompt: `הוסף ירקות`,
        state: vegetables.data?.data,
        sheetForm: `vegetables`,
        deleteFunc: deleteVegetables,
      },
      {
        value: `fatsItems`,
        btnPrompt: `הוסף שומנים`,
        state: fats.data?.data,
        sheetForm: `fats`,
        deleteFunc: deleteFats,
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
