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
import {
  convertItemsToOptions,
  extractVideoId,
  generateUUID,
  getYouTubeThumbnail,
} from "@/lib/utils";
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
  const { watch, getValues, resetField, control } = useFormContext<WorkoutSchemaType>();
  const { append, remove, update, replace } = useFieldArray<
    WorkoutSchemaType,
    `${typeof parentPath}.exercises`
  >({
    name: `${parentPath}.exercises`,
    control,
  });

  const exerciseQuery = useMuscleGroupExercisesQuery(muscleGroup);
  const { data: exerciseMethodResponse } = useExerciseMethodQuery();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const exerciseIndexToDelete = useRef<number | null>(null);

  const exercises = watch(`${parentPath}.exercises`) as IExercise[];

  const handleSelectExercise = (index: number, updatedExercise: IExercisePresetItem) => {
    const { name, linkToVideo, tipFromTrainer, exerciseMethod, _id } = updatedExercise;
    const exercise = getValues(`${parentPath}.exercises`)[index];
    const newExercise = {
      ...exercise,
      _id: _id || generateUUID(),
      name,
      linkToVideo,
      tipFromTrainer,
      exerciseMethod,
    };

    resetField(`${parentPath}.exercises.${index}`, { defaultValue: newExercise });
  };

  const handleUpdateExercise = (key: any, value: any, index: number) => {
    const exercise = getValues(`${parentPath}.exercises`)[index];

    update(index, { ...exercise, [key]: value });
  };

  const handleAddExcercise = () => {
    const newExercise: IExercise = {
      name: ``,
      sets: [defaultSet],
      linkToVideo: "",
      _id: generateUUID(),
      restTime: 60,
    };

    append(newExercise);
  };

  const handleMoveExercise = (exercises: IExercise[]) => {
    const clonedExercises = exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({ ...set })),
    }));

    replace(clonedExercises);
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
          <DragDropWrapper items={exercises || []} setItems={handleMoveExercise} idKey="_id">
            {({ item, index }) => (
              <SortableItem item={item} idKey="_id">
                {() => {
                  return (
                    <Card className={` sm:p-4 max-h-[575px] overflow-y-auto custom-scrollbar`}>
                      <CardHeader className="sm:p-4">
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-center justify-end w-full">
                            <Button
                              className="px-1.5 py-1.5"
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
                              render={() => {
                                return (
                                  <FormItem>
                                    <FormLabel className="font-bold underline">תרגיל</FormLabel>
                                    <ComboBox
                                      options={exerciseOptions}
                                      value={item.name}
                                      onSelect={(exercise) => {
                                        handleSelectExercise(index, exercise);
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
                              value={item.exerciseMethod}
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
                          <FormField
                            control={control}
                            name={`${parentPath}.exercises.${index}.restTime`}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel>זמן מנוחה (שנ'):</FormLabel>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={300}
                                    {...field}
                                    value={item.restTime}
                                    placeholder="זמן מנוחה..."
                                  />
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4 ">
                        <SetsContainer
                          key={item?._id + "-sets"}
                          parentPath={`${parentPath}.exercises.${index}`}
                        />
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
                                    value={item.linkToVideo}
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
                                    value={item.tipFromTrainer}
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
