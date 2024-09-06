import TemplateTabs from "@/components/templates/TemplateTabs";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ITabs } from "@/interfaces/interfaces";

const DietPlanTemplatePage = () => {
  const { deleteMenuItem } = useMenuItemApi();
  const { deleteDietPlanPreset } = useDietPlanPresetApi();

  const queryClient = useQueryClient();

  const deleteDietPlan = useMutation({
    mutationFn: deleteDietPlanPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`dietPlans`] });
    },
  });
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
      {
        name: `תפריטים`,
        value: `dietPlanPresets`,
        queryKey: `dietPlans`,
      },
      {
        name: `חלבונים`,
        value: `proteinItems`,
        queryKey: `protein`,
      },
      {
        name: `פחמימות`,
        value: `carbItems`,
        queryKey: `carbs`,
      },
      {
        name: `ירקות`,
        value: `vegetableItems`,
        queryKey: `vegetables`,
      },
      {
        name: `שומנים`,
        value: `fatsItems`,
        queryKey: `fats`,
      },
    ],
    tabContent: [
      {
        value: `dietPlanPresets`,
        btnPrompt: `הוסף תפריט`,
        sheetForm: `dietPlans`,
        deleteFunc: deleteDietPlan,
      },
      {
        value: `proteinItems`,
        btnPrompt: `הוסף חלבון`,
        sheetForm: `protein`,
        deleteFunc: deleteProteins,
      },
      {
        value: `carbItems`,
        btnPrompt: `הוסף פחמימה`,
        sheetForm: `carbs`,
        deleteFunc: deleteCarbs,
      },
      {
        value: `vegetableItems`,
        btnPrompt: `הוסף ירקות`,
        sheetForm: `vegetables`,
        deleteFunc: deleteVegetables,
      },
      {
        value: `fatsItems`,
        btnPrompt: `הוסף שומנים`,
        sheetForm: `fats`,
        deleteFunc: deleteFats,
      },
    ],
  };

  return (
    <div>
      <h1 className="text-2xl pb-5">תפריטים</h1>
      <TemplateTabs tabs={tabs} />
    </div>
  );
};

export default DietPlanTemplatePage;
