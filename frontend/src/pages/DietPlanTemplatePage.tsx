import TemplateTabs from "@/components/templates/TemplateTabs";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ITabs } from "@/interfaces/interfaces";
import { QueryKeys } from "@/enums/QueryKeys";

const DietPlanTemplatePage = () => {
  const { deleteMenuItem } = useMenuItemApi();
  const { deleteDietPlanPreset } = useDietPlanPresetApi();

  const queryClient = useQueryClient();

  const deleteDietPlan = useMutation({
    mutationFn: deleteDietPlanPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DIET_PLAN_PRESETS] });
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
        queryKey: QueryKeys.DIET_PLAN_PRESETS,
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
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl sm:text-right text-center">תפריטים</h1>
      <TemplateTabs tabs={tabs} />
    </div>
  );
};

export default DietPlanTemplatePage;
