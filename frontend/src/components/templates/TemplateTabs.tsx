import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PresetTable from "@/components/tables/PresetTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PresetSheet from "./PresetSheet";
import { useNavigate } from "react-router-dom";
import { UseMutationResult, useQuery } from "@tanstack/react-query";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { ITabs } from "@/interfaces/interfaces";
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

interface TemplateTabsProps {
  tabs: ITabs;
}

const TemplateTabs: React.FC<TemplateTabsProps> = ({ tabs }) => {
  const navigate = useNavigate();
  const { getMenuItems } = useMenuItemApi();
  const { getAllDietPlanPresets } = useDietPlanPresetApi();
  const { getAllWorkoutPlanPresets } = useWorkoutPlanPresetApi();
  const { getAllMuscleGroups } = useMuscleGroupsApi();
  const { getExercisePresets } = useExercisePresetApi();
  const { getAllExerciseMethods } = useExerciseMethodApi();

  const [selectedForm, setSelectedForm] = useState<string | undefined>();
  const [selectedObjectId, setSelectedObjectId] = useState<string>();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [queryKey, setQueryKey] = useState<string>(tabs.tabHeaders[0].queryKey);

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
    [`exercises`]: getExercisePresets,
    [`muscleGroups`]: getAllMuscleGroups,
    [QueryKeys.EXERCISE_METHODS]: getAllExerciseMethods,
  };

  const apiFunc = apiHooks[queryKey];

  const apiData = useQuery({
    queryKey: [queryKey],
    staleTime: Infinity,
    queryFn: () => apiFunc(queryKey),
    enabled: !!apiFunc,
    retry:3
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

  useEffect(()=>{
    if (apiData.data?.data[0].title){
      apiData.data.data.map(e=>e.name=e.title)
    }
  },[apiData])

  if (apiData.isError) return <ErrorPage message={apiData.error.message} />;

  return (
    <>
      <div>
        <Tabs defaultValue={tabs.tabHeaders[0].value} dir="rtl">
          <TabsList>
            {tabs.tabHeaders.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                onClick={() => setQueryKey(tab.queryKey)}
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {apiData.isLoading && <TemplateTabsSkeleton />}

          {!apiData.isLoading &&
            tabs.tabContent.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <Button onClick={() => handleAddNew(tab.sheetForm)} className="my-4">
                  {tab.btnPrompt}
                </Button>

                <PresetTable
                  data={apiData.data?.data || []}
                  handleDelete={(id) => deleteItem(id, tab.deleteFunc)}
                  retrieveObjectId={(id: string) => startEdit(id, tab.sheetForm)}
                />
              </TabsContent>
            ))}
        </Tabs>
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
