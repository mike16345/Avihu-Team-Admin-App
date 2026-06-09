import TemplateTabs from "@/components/templates/TemplateTabs";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ITabs } from "@/interfaces/interfaces";
import { QueryKeys } from "@/enums/QueryKeys";
import { FaUtensils } from "react-icons/fa6";

const DietPlanTemplatePage = () => {
  const { deleteMenuItem } = useMenuItemApi();
  const { deleteDietPlanPreset } = useDietPlanPresetApi();

  const queryClient = useQueryClient();

  const onDeleteMenuItemSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.MENU_ITEMS] });
  };

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
      onDeleteMenuItemSuccess();
    },
  });

  const deleteFats = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`fats`] });
      onDeleteMenuItemSuccess();
    },
  });

  const deleteVegetables = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`vegetables`] });
      onDeleteMenuItemSuccess();
    },
  });

  const deleteProteins = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`protein`] });
      onDeleteMenuItemSuccess();
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
    <div
      data-testid="diet-plan-templates-page"
      dir="rtl"
      className="flex flex-col gap-5 px-1"
      style={{ fontFamily: "Assistant, Heebo, system-ui, sans-serif" }}
    >
      {/* Hero header — same shell as workout templates and forms page */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100/60 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
        <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-blue-100/60 dark:bg-blue-950/30 blur-3xl" />
        <div className="relative flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-blue-500/25">
            <FaUtensils size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">תפריטים</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              ניהול תפריטי תזונה ומאגר המזון — חלבונים, פחמימות, ירקות ושומנים
            </p>
          </div>
        </div>
      </div>

      <TemplateTabs tabs={tabs} />
    </div>
  );
};

export default DietPlanTemplatePage;
