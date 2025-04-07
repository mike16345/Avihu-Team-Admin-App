import React, { useMemo, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { IExercisePresetItem, IExercise } from "@/interfaces/IWorkoutPlan";
import SetsContainer, { defaultSet } from "./SetsContainer";
import { Input } from "../ui/input";
import { IoClose } from "react-icons/io5";
import { Card, CardContent, CardHeader } from "../ui/card";
import { AddWorkoutPlanCard } from "./AddWorkoutPlanCard";
import DeleteModal from "../Alerts/DeleteModal";
import { Button } from "../ui/button";
import { convertItemsToOptions, extractVideoId, getYouTubeThumbnail } from "@/lib/utils";
import ComboBox from "../ui/combo-box";
import { SortableItem } from "../DragAndDrop/SortableItem";
import { DragDropWrapper } from "../Wrappers/DragDropWrapper";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { useFieldArray, useFormContext } from "react-hook-form";
import useMuscleGroupExercisesQuery from "@/hooks/queries/exercises/useMuscleGroupExercisesQuery";
import useExerciseMethodQuery from "@/hooks/queries/exercises/useExerciseMethodQuery";
import { FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

interface ExcerciseInputProps {
  muscleGroup?: string;
  parentPath: `workoutPlans.${number}.muscleGroups.${number}`;
}

const ExcerciseInput: React.FC<ExcerciseInputProps> = ({ muscleGroup, parentPath }) => {
  const { watch, getValues, setValue, resetField, control } = useFormContext<WorkoutSchemaType>();
  const {
    fields: exercises,
    append,
    remove,
    update,
    replace,
  } = useFieldArray<WorkoutSchemaType, `${typeof parentPath}.exercises`>({
    name: `${parentPath}.exercises`,
    control,
  });

  const exerciseQuery = useMuscleGroupExercisesQuery(muscleGroup);
  const { data: exerciseMethodResponse } = useExerciseMethodQuery();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const exerciseIndexToDelete = useRef<number | null>(null);

  const handleSelectExercise = (index: number, updatedExercise: IExercisePresetItem) => {
    const { name, linkToVideo, tipFromTrainer, exerciseMethod } = updatedExercise;
    const exercise = getValues(`${parentPath}.exercises`)[index];
    const newExercise = {
      ...exercise,
      name,
      linkToVideo,
      tipFromTrainer,
      exerciseMethod,
    };

    update(index, newExercise);
  };

  const handleUpdateExercise = (key: any, value: any, index: number) => {
    const exercise = getValues(`${parentPath}.exercises`)[index];
    const path = `${parentPath}.exercises.${index}.${key}`;

    update(index, { ...exercise, [key]: value });
    setValue(path, value);
  };

  const handleAddExcercise = () => {
    const newExercise: IExercise = {
      name: ``,
      sets: [defaultSet],
      linkToVideo: "",
    };

    append(newExercise);
  };

  const handleMoveExercise = (exercises: IExercise[]) => {
    replace(exercises);
    console.log("exercises", exercises);
    exercises.forEach((exercise, i) => {
      resetField(`${parentPath}.exercises.${i}.name`, { defaultValue: exercise.name });
      resetField(`${parentPath}.exercises.${i}.sets`, { defaultValue: exercise.sets });
      resetField(`${parentPath}.exercises.${i}.tipFromTrainer`, {
        defaultValue: exercise.tipFromTrainer,
      });
    });
  };

  const handleDeleteExcercise = () => {
    if (exerciseIndexToDelete.current === null) return;

    remove(exerciseIndexToDelete.current);
    exerciseIndexToDelete.current = null;
  };

  const exerciseOptions = useMemo(() => {
    if (!exerciseQuery.data) return [];

    const exercisesInMuscleGroup = exercises?.map((exercise) => exercise.name);
    const filteredExistingExercises = exerciseQuery.data?.filter(
      (exercise) =>
        exercisesInMuscleGroup?.find((exerciseName) => exercise.name == exerciseName) == undefined
    );

    return convertItemsToOptions(filteredExistingExercises || [], "name");
  }, [exerciseQuery.data, exercises]);

  const exerciseMethods = useMemo(() => {
    if (!exerciseMethodResponse?.data?.length) return [];

    return convertItemsToOptions(exerciseMethodResponse?.data, `title`, `title`);
  }, [exerciseMethodResponse]);

  return (
    <>
      <div className="w-full flex flex-col gap-3 py-4">
        <div className="grid lg:grid-cols-2 gap-4">
          <DragDropWrapper items={exercises} setItems={handleMoveExercise} idKey="id">
            {({ item, index }) => (
              <SortableItem item={item} idKey="id">
                {() => {
                  const exercise = watch(`${parentPath}.exercises.${index}`);

                  return (
                    <Card className={` sm:p-4 max-h-[575px] overflow-y-auto custom-scrollbar`}>
                      <CardHeader>
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-center justify-end w-full">
                            <Button
                              type="button"
                              variant={"ghost"}
                              onClick={() => {
                                exerciseIndexToDelete.current = index;
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <IoClose size={22} />
                            </Button>
                          </div>
                          <div className="w-fit">
                            <FormField
                              name={`${parentPath}.exercises.${index}.name`}
                              render={({ field }) => {
                                return (
                                  <FormItem>
                                    <FormLabel>תרגיל</FormLabel>
                                    <ComboBox
                                      options={exerciseOptions}
                                      value={field.value}
                                      onSelect={(exercise) => {
                                        handleSelectExercise(index, exercise);
                                        field.onChange(exercise.name);
                                      }}
                                    />
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                          {item.linkToVideo && (
                            <img
                              className="rounded mt-2"
                              src={getYouTubeThumbnail(extractVideoId(item.linkToVideo || ""))}
                            />
                          )}
                          <label className="font-bold underline pt-5">שיטת אימון:</label>
                          <div className="w-fit flex gap-5">
                            <ComboBox
                              options={exerciseMethods}
                              value={exercise.exerciseMethod}
                              onSelect={(exerciseMethod) => {
                                handleUpdateExercise("exerciseMethod", exerciseMethod, index);
                              }}
                            />
                            <Button
                              type="button"
                              onClick={() =>
                                handleUpdateExercise("exerciseMethod", undefined, index)
                              }
                            >
                              נקה
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4 ">
                        <SetsContainer parentPath={`${parentPath}.exercises.${index}`} />
                        <div className=" flex flex-col gap-4">
                          <FormField
                            control={control}
                            name={`${parentPath}.exercises.${index}.linkToVideo`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel>לינק לסרטון</FormLabel>
                                  <Input
                                    {...field}
                                    value={exercise.linkToVideo}
                                    placeholder="הכנס לינק כאן..."
                                  />
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                          <FormField
                            control={control}
                            name={`${parentPath}.exercises.${index}.tipFromTrainer`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel>דגשים</FormLabel>
                                  <Textarea
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      handleUpdateExercise("tipFromTrainer", value, index);
                                    }}
                                    value={field.value}
                                    placeholder="דגשים למתאמן..."
                                  />
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                }}
              </SortableItem>
            )}
          </DragDropWrapper>
          <div className="h-[575px]">
            <AddWorkoutPlanCard onClick={() => handleAddExcercise()} />
          </div>
        </div>
      </div>
      <DeleteModal
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        onConfirm={() => handleDeleteExcercise()}
      />
    </>
  );
};

export default ExcerciseInput;
