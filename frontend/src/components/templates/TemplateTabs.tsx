import React, { useEffect, useState } from "react";
import ExercisePresetGrid from "./workoutTemplates/ExercisePresetGrid";
import SimplePresetGrid from "./workoutTemplates/SimplePresetGrid";
import { toast } from "sonner";
import PresetSheet from "./PresetSheet";
import { useNavigate } from "react-router-dom";
import { UseMutationResult, useQuery } from "@tanstack/react-query";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { ITabs } from "@/interfaces/interfaces";
import { IExercisePresetItem, IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import useMenuItemApi from "@/hooks/api/useMenuItemApi";
import { useDietPlanPresetApi } from "@/hooks/api/useDietPlanPresetsApi";
import { ApiResponse } from "@/types/types";
import TemplateTabsSkeleton from "../ui/skeletons/TemplateTabsSkeleton";
import ErrorPage from "@/pages/ErrorPage";
import { useWorkoutPlanPresetApi } from "@/hooks/api/useWorkoutPlanPresetsApi";
import useMuscleGroupsApi from "@/hooks/api/useMuscleGroupsApi";
import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import { QueryKeys } from "@/enums/QueryKeys";
import useExerciseMethodApi from "@/hooks/api/useExerciseMethodsApi";
import { createRetryFunction } from "@/lib/utils";
import useCardioWorkoutApi from "@/hooks/api/useCardioWorkoutPreset";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import WorkoutPresetGrid from "./workoutTemplates/WorkoutPresetGrid";
import DietPlanPresetGrid from "./dietTemplates/DietPlanPresetGrid";
import { IDietPlanPreset } from "@/interfaces/IDietPlan";
import { FaPlus } from "react-icons/fa6";

interface TemplateTabsProps {
  tabs: ITabs;
}

const createTemplateTabsTestId = (value?: string) =>
  (value ?? "tab")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const getTabButtonClassName = (active: boolean) => {
  if (active) return "brand-gradient brand-gradient-hover text-white shadow-md shadow-blue-500/25";

  return "text-slate-500 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300";
};

const getSimpleGridCopy = (activeTab: string) => {
  if (activeTab === "cardioWorkouts") {
    return {
      variant: "cardio" as const,
      searchPlaceholder: "חיפוש לפי שם תרגיל אירובי…",
      emptyLabel: "לא נמצאו תרגילי אירובי",
    };
  }

  return {
    variant: "method" as const,
    searchPlaceholder: "חיפוש לפי שם שיטה…",
    emptyLabel: "לא נמצאו שיטות אימון",
  };
};

const TemplateAddButton = ({
  testId,
  label,
  onClick,
}: {
  testId: string;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    data-testid={testId}
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
  >
    <FaPlus size={11} />
    {label}
  </button>
);

const TemplateTabs: React.FC<TemplateTabsProps> = ({ tabs }) => {
  const navigate = useNavigate();
  const { getMenuItems } = useMenuItemApi();
  const { getAllDietPlanPresets } = useDietPlanPresetApi();
  const { getAllWorkoutPlanPresets } = useWorkoutPlanPresetApi();
  const { getAllMuscleGroups } = useMuscleGroupsApi();
  const { getExercisePresets } = useExercisePresetApi();
  const { getAllExerciseMethods } = useExerciseMethodApi();
  const { getAllCardioWrkouts } = useCardioWorkoutApi();

  const [activeTab, setActiveTab] = useState<string>(tabs.tabHeaders[0].value);
  const [selectedForm, setSelectedForm] = useState<string | undefined>();
  const [selectedObjectId, setSelectedObjectId] = useState<string>();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [queryKey, setQueryKey] = useState<string>(tabs.tabHeaders[0].queryKey);

  const getTabQueryKey = (tabValue: string) =>
    tabs.tabHeaders.find((tabHeader) => tabHeader.value === tabValue)?.queryKey ?? tabValue;

  type ApiHooks = {
    [key: string]: (params: any) => Promise<ApiResponse<any[]>>;
  };

  const apiHooks: ApiHooks = {
    [`carbs`]: getMenuItems,
    [`protein`]: getMenuItems,
    [`fats`]: getMenuItems,
    [`vegetables`]: getMenuItems,
    [QueryKeys.DIET_PLAN_PRESETS]: getAllDietPlanPresets,
    [QueryKeys.WORKOUT_PRESETS]: getAllWorkoutPlanPresets,
    [QueryKeys.EXERCISES]: getExercisePresets,
    [QueryKeys.MUSCLE_GROUP]: getAllMuscleGroups,
    [QueryKeys.EXERCISE_METHODS]: getAllExerciseMethods,
    [QueryKeys.CARDIO_WORKOUT_PRESET]: getAllCardioWrkouts,
  };

  const apiFunc = apiHooks[queryKey];

  const apiData = useQuery({
    queryKey: [queryKey],
    staleTime: FULL_DAY_STALE_TIME,
    queryFn: () => apiFunc(queryKey),
    enabled: !!apiFunc,
    retry: createRetryFunction(404, 2),
  });

  const deleteItem = (
    id: string,
    deleteFunc: UseMutationResult<unknown, Error, string, unknown>
  ) => {
    deleteFunc.mutate(id);
    if (deleteFunc.isError) {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
        description: deleteFunc.error.message,
      });
      return;
    }
    toast.success(`פריט נמחק בהצלחה!`);
  };

  const startEdit = (id: string, formToUse: string) => {
    if (formToUse === `dietPlans`) {
      navigate(`/presets/dietPlans/${id}`);
    } else if (formToUse === `workoutPlan`) {
      navigate(`/presets/workoutPlans/${id}`);
    } else {
      setSelectedForm(formToUse);
      setSelectedObjectId(id);
    }
  };

  const handleAddNew = (formToUse: string) => {
    if (formToUse === `dietPlans`) {
      navigate(`/presets/dietPlans`);
    } else if (formToUse === `workoutPlan`) {
      navigate(`/presets/workoutPlans/`);
    } else {
      setSelectedForm(formToUse);
      setIsSheetOpen(true);
    }
  };

  const onCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedObjectId(undefined);
    setSelectedForm(undefined);
  };

  useEffect(() => {
    if (!selectedObjectId) return;
    setIsSheetOpen(true);
  }, [selectedObjectId]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setQueryKey(getTabQueryKey(value));
  };

  if (apiData.isError && apiData?.error?.status !== 404)
    return <ErrorPage message={apiData.error.message} />;

  const activeContent = tabs.tabContent.find((t) => t.value === activeTab);

  const renderActiveContent = () => {
    if (!activeContent) return null;

    const actionButton = (
      <TemplateAddButton
        testId={`template-add-${createTemplateTabsTestId(activeContent.value)}`}
        label={activeContent.btnPrompt}
        onClick={() => handleAddNew(activeContent.sheetForm)}
      />
    );

    if (activeTab === "WorkoutPlans") {
      return (
        <WorkoutPresetGrid
          data={(apiData.data?.data as (IWorkoutPlanPreset & { _id?: string })[]) || []}
          onOpen={(id) => startEdit(id, activeContent.sheetForm)}
          onDelete={(id) => deleteItem(id, activeContent.deleteFunc)}
          onAddNew={() => handleAddNew(activeContent.sheetForm)}
          addLabel={activeContent.btnPrompt}
        />
      );
    }

    if (activeTab === "dietPlanPresets") {
      return (
        <DietPlanPresetGrid
          data={(apiData.data?.data as (IDietPlanPreset & { _id?: string })[]) || []}
          onOpen={(id) => startEdit(id, activeContent.sheetForm)}
          onDelete={(id) => deleteItem(id, activeContent.deleteFunc)}
          onAddNew={() => handleAddNew(activeContent.sheetForm)}
          addLabel={activeContent.btnPrompt}
        />
      );
    }

    if (activeTab === "exercises") {
      return (
        <ExercisePresetGrid
          data={(apiData.data?.data as IExercisePresetItem[]) || []}
          onView={(id) => startEdit(id, activeContent.sheetForm)}
          onDelete={(id) => deleteItem(id, activeContent.deleteFunc)}
          actionButton={actionButton}
        />
      );
    }

    const simpleGridCopy = getSimpleGridCopy(activeTab);

    return (
      <SimplePresetGrid
        data={apiData.data?.data || []}
        variant={simpleGridCopy.variant}
        onView={(id) => startEdit(id, activeContent.sheetForm)}
        onDelete={(id) => deleteItem(id, activeContent.deleteFunc)}
        searchPlaceholder={simpleGridCopy.searchPlaceholder}
        emptyLabel={simpleGridCopy.emptyLabel}
        actionButton={actionButton}
      />
    );
  };

  return (
    <>
      <div data-testid="template-tabs" dir="rtl" className="flex flex-col gap-4 font-heebo">
        <div className="inline-flex w-fit items-center gap-1 rounded-2xl border border-blue-100/60 dark:border-blue-900/40 bg-white dark:bg-slate-900 p-1 shadow-sm">
          {tabs.tabHeaders.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                data-testid={`template-tab-${createTemplateTabsTestId(tab.queryKey)}`}
                onClick={() => handleTabChange(tab.value)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-150 ${getTabButtonClassName(
                  active
                )}`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {apiData.isLoading && <TemplateTabsSkeleton />}

        {!apiData.isLoading && activeContent && <div>{renderActiveContent()}</div>}
      </div>

      <PresetSheet
        isOpen={isSheetOpen}
        onCloseSheet={onCloseSheet}
        form={selectedForm}
        id={selectedObjectId}
      />
    </>
  );
};

export default TemplateTabs;
