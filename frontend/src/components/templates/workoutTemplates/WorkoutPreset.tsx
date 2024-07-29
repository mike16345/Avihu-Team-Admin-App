import { Button } from "@/components/ui/button";
import { IMuscleGroupWorkouts, IWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import { Fragment, useEffect, useState } from "react";
import { BsPlusCircleFill } from "react-icons/bs";
import { Input } from "@/components/ui/input";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useWorkoutPlanPresetApi } from "@/hooks/useWorkoutPlanPresetsApi";
import { cleanWorkoutObject } from "@/utils/workoutPlanUtils";
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

const workoutFormSchema = z.object({
  name: z.string().min(1).max(25),
});

const WorkoutPreset = () => {
  const { id } = useParams();
  const isEdit = id !== undefined;

  const workoutForm = useForm<any>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const { addWorkoutPlanPreset, getWorkoutPlanPresetById, updateWorkoutPlanPreset } =
    useWorkoutPlanPresetApi();

  const [workoutPlan, setWorkoutPlan] = useState<IWorkoutPlan[]>([]);

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
    };

    const cleanedObject = cleanWorkoutObject(postObject);

    if (isEdit) {
      if (!id) return;

      updateWorkoutPlanPreset(id, cleanedObject)
        .then(() => toast.success(`תבנית אימון נשמרה בהצלחה!`))
        .catch((err) =>
          toast.error(`אופס! נתקלנו בבעיה..`, {
            description: err.response.data.message,
          })
        );
    } else {
      addWorkoutPlanPreset(cleanedObject)
        .then(() => toast.success(`תבנית אימון נשמרה בהצלחה!`))
        .catch((err) =>
          toast.error(`אופס! נתקלנו בבעיה..`, {
            description: err.response.data.message,
          })
        );
    }
  };

  useEffect(() => {
    if (!id) return;

    getWorkoutPlanPresetById(id)
      .then((res) => {
        setWorkoutPlan(res.workoutPlans);
        workoutForm.setValue("name", res.name);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <EditableContextProvider isEdit={true}>
      <div className="flex flex-col gap-4 p-5 overflow-y-scroll hide-scrollbar w-5/6 max-h-[95vh] ">
        <h1 className="text-5xl">תבנית אימון</h1>
        <p>{isEdit ? `כאן תוכל לערוך תבנית אימון קיימת` : `  כאן תוכל ליצור תבנית אימון חדשה`}</p>
        <div className="flex flex-col gap-2 px-2 py-4">
          <div className="w-3/4 py-4 border-b-2 mb-2">
            <Form {...workoutForm}>
              <form>
                <FormField
                  control={workoutForm.control}
                  name="name"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="font-bold underline pb-3">שם התבנית:</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="שם..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </form>
            </Form>
          </div>

          {workoutPlan.map((workout, i) => (
            <Fragment key={i}>
              <WorkoutContainer
                initialMuscleGroups={workout.muscleGroups}
                handleSave={(workouts) => handleSave(i, workouts)}
                title={workout.planName}
                handlePlanNameChange={(newName) => handlePlanNameChange(newName, i)}
                handleDeleteWorkout={() => handleDeleteWorkout(i)}
              />
            </Fragment>
          ))}
          <div className="w-full flex items-center justify-center">
            <Button onClick={handleAddWorkout}>
              <div className="flex flex-col items-center font-bold">
                הוסף אימון
                <BsPlusCircleFill />
              </div>
            </Button>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={workoutForm.handleSubmit(handleSubmit)} variant="success">
            שמור תוכנית אימון
          </Button>
        </div>
      </div>
    </EditableContextProvider>
  );
};

export default WorkoutPreset;
