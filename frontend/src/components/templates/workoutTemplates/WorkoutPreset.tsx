import { Button } from "@/components/ui/button";
import {
  ICardioPlan,
  IMuscleGroupWorkouts,
  IWorkoutPlan,
  IWorkoutPlanPreset,
} from "@/interfaces/IWorkoutPlan";
import { Fragment, useEffect, useMemo, useState } from "react";
import { BsPlusCircleFill } from "react-icons/bs";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useWorkoutPlanPresetApi } from "@/hooks/api/useWorkoutPlanPresetsApi";
import { cleanWorkoutObject, parseErrorFromObject } from "@/utils/workoutPlanUtils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import WorkoutContainer from "@/components/workout plan/WorkoutPlanContainer";
import { EditableContextProvider } from "@/context/useIsEditableContext";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import WorkoutPlanContainerWrapper from "@/components/Wrappers/WorkoutPlanContainerWrapper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MainRoutes } from "@/enums/Routes";
import { QueryKeys } from "@/enums/QueryKeys";
import CustomButton from "@/components/ui/CustomButton";
import BackButton from "@/components/ui/BackButton";
import ComboBox from "@/components/ui/combo-box";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { convertItemsToOptions } from "@/lib/utils";
import { defaultSimpleCardioOption } from "@/constants/cardioOptions";
import CardioWrapper from "@/components/workout plan/cardio/CardioWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MAX_NAME_LENGTH = 75;
const MIN_NAME_LENGTH = 2;

const workoutFormSchema = z.object({
  name: z
    .string()
    .min(MIN_NAME_LENGTH, `שם התבנית חייב להיות לפחות  ${MIN_NAME_LENGTH} אותיות`)
    .max(MAX_NAME_LENGTH, `שם התבנית חייב להיות פחות מ-${MAX_NAME_LENGTH} אותיות`),
});

const WorkoutPreset = () => {
  const { id } = useParams();
  const navigation = useNavigate();
  const isEdit = id !== undefined;

  const [selectedPreset, setSelectedPreset] = useState<IWorkoutPlanPreset | null>(null);

  const workoutForm = useForm<any>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const queryClient = useQueryClient();

  const {
    addWorkoutPlanPreset,
    getAllWorkoutPlanPresets,
    getWorkoutPlanPresetById,
    updateWorkoutPlanPreset,
  } = useWorkoutPlanPresetApi();

  const workoutPlanPresets = useQuery({
    queryFn: getAllWorkoutPlanPresets,
    staleTime: FULL_DAY_STALE_TIME,
    queryKey: [QueryKeys.WORKOUT_PRESETS],
  });

  const getWorkoutPresetById = async () => {
    if (!id) return;

    try {
      const workoutPreset = await getWorkoutPlanPresetById(id);
      initWorkoutPreset(workoutPreset);

      return workoutPreset;
    } catch (error) {
      throw error;
    }
  };

  const initWorkoutPreset = (workoutPreset: IWorkoutPlanPreset) => {
    setWorkoutPlan(workoutPreset.workoutPlans);
    setCardioPlan(workoutPreset.cardio);
    workoutForm.setValue("name", workoutPreset.name);
  };

  const { data: fetchedWorkoutPreset } = useQuery({
    queryKey: [QueryKeys.WORKOUT_PRESETS, id],
    queryFn: getWorkoutPresetById,
    enabled: isEdit,
    staleTime: Infinity,
  });

  const workoutPresetsOptions = useMemo(
    () => convertItemsToOptions(workoutPlanPresets.data?.data || [], "name"),
    [workoutPlanPresets.data]
  );

  const onSuccess = () => {
    toast.success(`תבנית אימון נשמרה בהצלחה!`);
    navigation(MainRoutes.WORKOUT_PLANS_PRESETS);
    queryClient.invalidateQueries({ queryKey: [QueryKeys.WORKOUT_PRESETS] });
  };

  const onError = (error: any) => {
    const message = parseErrorFromObject(error.data || "");

    toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
      description: message,
    });
  };

  const [workoutPlan, setWorkoutPlan] = useState<IWorkoutPlan[]>([]);
  const [cardioPlan, setCardioPlan] = useState<ICardioPlan>({
    type: `simple`,
    plan: defaultSimpleCardioOption,
  });

  const handlePlanNameChange = (newName: string, index: number) => {
    const newWorkoutPlan = workoutPlan.map((workout, i) =>
      i == index ? { ...workout, planName: newName } : workout
    );
    setWorkoutPlan(newWorkoutPlan);
  };

  const handleAddWorkout = () => {
    const newObject: IWorkoutPlan = {
      planName: `אימון ${workoutPlan.length + 1}`,
      muscleGroups: [],
    };

    setWorkoutPlan([...workoutPlan, newObject]);
  };

  const handleDeleteWorkout = (index: number) => {
    const filteredArr = workoutPlan.filter((_, i) => i !== index);

    setWorkoutPlan(filteredArr);
  };

  const handleSave = (index: number, workouts: IMuscleGroupWorkouts[]) => {
    setWorkoutPlan((prevWorkoutPlan) => {
      const workoutExists = prevWorkoutPlan[index];

      if (workoutExists) {
        return prevWorkoutPlan.map((workout, i) =>
          i === index ? { ...workout, muscleGroups: workouts } : workout
        );
      } else {
        return [
          ...prevWorkoutPlan,
          { planName: `אימון ${workoutPlan.length + 1}`, muscleGroups: workouts },
        ];
      }
    });
  };

  const handleSubmit = (values: z.infer<typeof workoutFormSchema>) => {
    const postObject = {
      name: values.name,
      workoutPlans: [...workoutPlan],
      cardio: cardioPlan,
    };

    const cleanedObject = cleanWorkoutObject(postObject);

    if (isEdit) {
      if (!id) return Promise.reject();

      return updateWorkoutPlanPreset(id, cleanedObject);
    } else {
      return addWorkoutPlanPreset(cleanedObject);
    }
  };

  const workoutPlanMutator = useMutation({
    mutationFn: (values: z.infer<typeof workoutFormSchema>) => handleSubmit(values),
    onSuccess,
    onError,
  });

  useEffect(() => {
    // Ensure it only runs if plan is undefined and the data was fetched
    if (!fetchedWorkoutPreset || workoutPlan.length > 0) return;

    initWorkoutPreset(fetchedWorkoutPreset);
  }, [fetchedWorkoutPreset]);

  return (
    <EditableContextProvider isEdit={true}>
      <div className="flex flex-col gap-4 p-4 overflow-y-scroll hide-scrollbar h-full">
        <h1 className="text-4xl">תבנית אימון</h1>
        <BackButton navLink={MainRoutes.WORKOUT_PLANS_PRESETS} />
        <p>{isEdit ? `כאן תוכל לערוך תבנית אימון קיימת` : `  כאן תוכל ליצור תבנית אימון חדשה`}</p>
        <div className="flex flex-col gap-2 py-4">
          <div className="w-full py-4 border-b-2 mb-2">
            <div className="space-y-4">
              <Form {...workoutForm}>
                <form>
                  <FormField
                    control={workoutForm.control}
                    name="name"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel className="font-bold text-lg pb-3">שם התבנית</FormLabel>
                          <FormControl>
                            <Input className="sm:w-2/4" {...field} placeholder="שם..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </form>
              </Form>
              <div className="space-y-2 sm:w-2/4">
                <span>תבניות</span>
                <ComboBox
                  value={selectedPreset}
                  options={workoutPresetsOptions}
                  onSelect={(currentValue) => {
                    setWorkoutPlan(currentValue.workoutPlans);
                    setSelectedPreset(currentValue.name);
                  }}
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="workout" className="" dir="rtl">
            <TabsList>
              <TabsTrigger value="workout">אימונים</TabsTrigger>
              <TabsTrigger value="cardio">אירובי</TabsTrigger>
            </TabsList>
            <TabsContent value="cardio">
              <CardioWrapper
                cardioPlan={cardioPlan}
                updateCardio={(cardioObject) => setCardioPlan(cardioObject)}
              />
            </TabsContent>
            <TabsContent value="workout">
              {workoutPlan.map((workout, i) => (
                <Fragment key={workout?._id || workout.planName + i}>
                  <WorkoutPlanContainerWrapper workoutPlan={workout}>
                    <WorkoutContainer
                      initialMuscleGroups={workout.muscleGroups}
                      handleSave={(workouts) => handleSave(i, workouts)}
                      title={workout.planName}
                      handlePlanNameChange={(newName) => handlePlanNameChange(newName, i)}
                      handleDeleteWorkout={() => handleDeleteWorkout(i)}
                    />
                  </WorkoutPlanContainerWrapper>
                </Fragment>
              ))}
              <div className="w-full mt-2 flex items-center justify-center">
                <Button className="w-full sm:w-32" onClick={handleAddWorkout}>
                  <div className="flex flex-col items-center font-bold">
                    הוסף אימון
                    <BsPlusCircleFill />
                  </div>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end">
          <CustomButton
            onClick={workoutForm.handleSubmit((values) => workoutPlanMutator.mutate(values))}
            variant="success"
            className="w-full sm:w-32"
            title="שמור תוכנית אימון"
            isLoading={workoutPlanMutator.isPending}
            type="submit"
          />
        </div>
      </div>
    </EditableContextProvider>
  );
};

export default WorkoutPreset;
