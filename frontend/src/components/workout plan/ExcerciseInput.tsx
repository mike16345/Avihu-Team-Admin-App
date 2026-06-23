import React, { useMemo, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { IExercisePresetItem, IExercise } from "@/interfaces/IWorkoutPlan";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import SetsContainer from "./SetsContainer";
import { AddWorkoutPlanCard } from "./AddWorkoutPlanCard";
import DeleteModal from "../Alerts/DeleteModal";
import ComboBox from "../ui/combo-box";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { SortableItem } from "../DragAndDrop/SortableItem";
import { DragDropWrapper } from "../Wrappers/DragDropWrapper";
import { FormField, FormItem, FormMessage } from "../ui/form";
import useMuscleGroupExercisesQuery from "@/hooks/queries/exercises/useMuscleGroupExercisesQuery";
import useExerciseMethodQuery from "@/hooks/queries/exercises/useExerciseMethodQuery";
import {
  buildPhotoUrl,
  convertItemsToOptions,
  generateUUID,
  getYouTubeThumbnail,
} from "@/lib/utils";
import { FaXmark } from "react-icons/fa6";
import { defaultSet } from "./workoutPlanDefaults";

interface ExcerciseInputProps {
  muscleGroup?: string;
  parentPath: `workoutPlans.${number}.muscleGroups.${number}`;
}

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
    {children}
  </span>
);

type ExerciseReference = Partial<IExercisePresetItem & IExercise> & {
  imageUrl?: string;
};

const getExerciseTip = (selectedTip: string | undefined, existingTip: string | undefined) => {
  if (selectedTip) return selectedTip;
  return existingTip || undefined;
};

const getExerciseReference = (exercise: IExercise): ExerciseReference => {
  if (typeof exercise.exerciseId === "object") return exercise.exerciseId || {};
  return exercise;
};

const getExercisePreviewImageUrl = (imageUrl: string | undefined, linkToVideo: string) => {
  if (imageUrl) return buildPhotoUrl(imageUrl);
  return getYouTubeThumbnail(linkToVideo);
};

const ExcerciseInput: React.FC<ExcerciseInputProps> = ({ muscleGroup, parentPath }) => {
  const { watch, getValues, resetField, control } = useFormContext<WorkoutSchemaType>();
  const { append, move, remove, update } = useFieldArray<
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
      exerciseId: _id!,
      name,
      linkToVideo,
      exerciseMethod,
      tipFromTrainer: getExerciseTip(tipFromTrainer, exercise.tipFromTrainer),
    };

    resetField(`${parentPath}.exercises.${index}`, { defaultValue: newExercise });
  };

  const handleUpdateExercise = (key: any, value: any, index: number) => {
    const exercise = getValues(`${parentPath}.exercises`)[index];
    update(index, { ...exercise, [key]: value });
  };

  const handleAddExcercise = () => {
    const newExercise = {
      name: ``,
      exerciseId: "",
      sets: [defaultSet],
      linkToVideo: "",
      _id: generateUUID(),
      restTime: 60,
    };
    append(newExercise);
  };

  const handleDeleteExcercise = () => {
    if (exerciseIndexToDelete.current === null) return;
    remove(exerciseIndexToDelete.current);
    exerciseIndexToDelete.current = null;
  };

  const exerciseOptions = useMemo(() => {
    if (!exerciseQuery.data) return [];
    const exercisesInGroup = exercises?.map((e) => e.name);
    const filtered = exerciseQuery.data.filter((e) => !exercisesInGroup?.includes(e.name));
    return convertItemsToOptions(filtered, "name");
  }, [exerciseQuery.data, exercises]);

  const exerciseMethods = useMemo(() => {
    if (!exerciseMethodResponse?.data?.length) return [];
    return convertItemsToOptions(exerciseMethodResponse.data, "title", "title");
  }, [exerciseMethodResponse]);

  return (
    <div dir="rtl" className="w-full font-heebo">
      <div className="grid gap-4 lg:grid-cols-2">
        <DragDropWrapper items={exercises || []} onMove={move} idKey="_id">
          {({ item, index }) => (
            <SortableItem item={item} idKey="_id">
              {() => {
                const exerciseRef = getExerciseReference(item);
                const name = exerciseRef.name || "";
                const linkToVideo = exerciseRef.linkToVideo || "";
                const { imageUrl } = exerciseRef;

                return (
                  <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <FormField
                        name={`${parentPath}.exercises.${index}.name`}
                        render={() => (
                          <FormItem className="flex-1 space-y-1">
                            <SectionLabel>תרגיל</SectionLabel>
                            <ComboBox
                              options={exerciseOptions}
                              value={name}
                              onSelect={(exercise) => handleSelectExercise(index, exercise)}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          exerciseIndexToDelete.current = index;
                          setIsDeleteModalOpen(true);
                        }}
                        className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400"
                        aria-label="מחק תרגיל"
                      >
                        <FaXmark size={13} />
                      </button>
                    </div>

                    {linkToVideo && (
                      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                        <img
                          className="aspect-video w-full object-cover"
                          src={getExercisePreviewImageUrl(imageUrl, linkToVideo)}
                          alt={name}
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
                      <FormItem className="space-y-1 min-w-0">
                        <SectionLabel>שיטת אימון</SectionLabel>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <ComboBox
                              options={exerciseMethods}
                              value={item.exerciseMethod}
                              onSelect={(method) =>
                                handleUpdateExercise("exerciseMethod", method, index)
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs shrink-0"
                            onClick={() => handleUpdateExercise("exerciseMethod", undefined, index)}
                          >
                            נקה
                          </Button>
                        </div>
                      </FormItem>

                      <FormField
                        control={control}
                        name={`${parentPath}.exercises.${index}.restTime`}
                        render={({ field }) => (
                          <FormItem className="space-y-1 w-24">
                            <SectionLabel>זמן מנוחה (שנ׳)</SectionLabel>
                            <Input
                              type="number"
                              min={1}
                              max={300}
                              {...field}
                              value={item.restTime}
                              className="h-9 text-sm"
                              placeholder="60"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 p-3">
                      <div className="mb-2">
                        <SectionLabel>סטים</SectionLabel>
                      </div>
                      <SetsContainer
                        key={item?._id + "-sets"}
                        parentPath={`${parentPath}.exercises.${index}`}
                      />
                    </div>

                    <FormField
                      control={control}
                      name={`${parentPath}.exercises.${index}.linkToVideo`}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <SectionLabel>לינק לסרטון</SectionLabel>
                          <Input
                            {...field}
                            value={linkToVideo}
                            className="h-9 text-sm"
                            placeholder="https://..."
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                );
              }}
            </SortableItem>
          )}
        </DragDropWrapper>

        <div className="min-h-[240px]">
          <AddWorkoutPlanCard onClick={() => handleAddExcercise()} />
        </div>
      </div>

      <DeleteModal
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        onConfirm={() => handleDeleteExcercise()}
      />
    </div>
  );
};

export default ExcerciseInput;
