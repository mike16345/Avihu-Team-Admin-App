import React, { useEffect, useMemo, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IExercisePresetItem, ISet, IExercise } from "@/interfaces/IWorkoutPlan";
import SetsContainer from "./SetsContainer";
import { Input } from "../ui/input";
import { IoClose } from "react-icons/io5";
import { Card, CardContent, CardHeader } from "../ui/card";
import { AddWorkoutPlanCard } from "./AddWorkoutPlanCard";
import useExercisePresetApi from "@/hooks/api/useExercisePresetApi";
import { useIsEditableContext } from "@/context/useIsEditableContext";
import DeleteModal from "../Alerts/DeleteModal";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  convertItemsToOptions,
  createRetryFunction,
  extractVideoId,
  getYouTubeThumbnail,
} from "@/lib/utils";
import ComboBox from "../ui/combo-box";
import { FULL_DAY_STALE_TIME } from "@/constants/constants";
import { QueryKeys } from "@/enums/QueryKeys";
import useExerciseMethodApi from "@/hooks/api/useExerciseMethodsApi";
import { Option } from "@/types/types";
import { SortableItem } from "../DragAndDrop/SortableItem";
import { DragDropWrapper } from "../Wrappers/DragDropWrapper";

interface ExcerciseInputProps {
  muscleGroup?: string;
  handleUpdateExercises: (workouts: IExercise[]) => void;
  exercises?: IExercise[];
}

const ExcerciseInput: React.FC<ExcerciseInputProps> = ({
  muscleGroup,
  handleUpdateExercises,
  exercises,
}) => {
  const { isEditable } = useIsEditableContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { getExerciseByMuscleGroup } = useExercisePresetApi();
  const { getAllExerciseMethods } = useExerciseMethodApi();
  const exerciseIndexToDelete = useRef<number | null>(null);
  const [exerciseMethods, setExerciseMethods] = useState<Option[] | null>(null);

  const doQuery = !!muscleGroup && isEditable;
  const exerciseQuery = useQuery({
    queryKey: [`exercise-${muscleGroup}`],
    queryFn: () => getExerciseByMuscleGroup(muscleGroup!).then((res) => res.data),
    staleTime: FULL_DAY_STALE_TIME,
    enabled: doQuery,
    retry: createRetryFunction(404),
  });

  const { data: exerciseMethodResponse } = useQuery({
    queryKey: [QueryKeys.EXERCISE_METHODS],
    queryFn: () => getAllExerciseMethods(),
    staleTime: FULL_DAY_STALE_TIME,
    retry: createRetryFunction(404, 2),
  });

  const exerciseOptions = useMemo(() => {
    if (!exerciseQuery.data) return [];
    const exercisesInMuscleGroup = exercises?.map((exercise) => exercise.name);

    const filteredExistingExercises = exerciseQuery.data?.filter(
      (exercise) =>
        exercisesInMuscleGroup?.find((exerciseName) => exercise.name == exerciseName) == undefined
    );

    return convertItemsToOptions(filteredExistingExercises || [], "name");
  }, [exerciseQuery.data, exercises]);

  const [exerciseObjs, setExerciseObjs] = useState<IExercise[]>(
    exercises || [
      {
        name: ``,
        sets: [],
      },
    ]
  );

  const handleUpdateWorkoutObject = <K extends keyof IExercise>(
    key: K,
    value: IExercise[K],
    index: number
  ) => {
    const updatedExercises = exerciseObjs.map((workout, i) =>
      i === index ? { ...workout, [key]: value } : workout
    );

    setExerciseObjs(updatedExercises);
    handleUpdateExercises(updatedExercises);
  };

  const handleUpdateExercise = (index: number, updatedExercise: IExercisePresetItem) => {
    const { name, linkToVideo, tipFromTrainer, exerciseMethod } = updatedExercise;

    setExerciseObjs((prevExercises) => {
      const updatedExercises = [...prevExercises];
      updatedExercises[index] = {
        ...prevExercises[index],
        name,
        linkToVideo,
        tipFromTrainer,
        exerciseMethod,
      };

      handleUpdateExercises(updatedExercises);
      return updatedExercises;
    });
  };

  const handleAddExcercise = () => {
    const newExercise: IExercise = {
      name: ``,
      sets: [
        {
          minReps: 0,
          maxReps: 0,
        },
      ],
    };

    const updatedExercises = [...exerciseObjs, newExercise];

    setExerciseObjs(updatedExercises);
    handleUpdateExercises(updatedExercises);
  };

  const handleDeleteExcercise = () => {
    if (exerciseIndexToDelete.current === null) return;

    const updatedExercises = exerciseObjs.filter((_, i) => i !== exerciseIndexToDelete.current);

    setExerciseObjs(updatedExercises);
    handleUpdateExercises(updatedExercises);
    exerciseIndexToDelete.current = null;
  };

  const updateSets = (setsArr: ISet[], index: number) => {
    setExerciseObjs((prevExercises) => {
      const updatedWorkouts = [...prevExercises];
      updatedWorkouts[index] = {
        ...prevExercises[index],
        sets: setsArr,
      };

      handleUpdateExercises(updatedWorkouts);
      return updatedWorkouts;
    });
  };

  const formatExerciseMethods = (methods) => {
    const newValues = convertItemsToOptions(methods, `title`, `title`);

    setExerciseMethods(newValues);
  };

  useEffect(() => {
    if (!exerciseMethodResponse?.data?.length || exerciseMethods) return;

    formatExerciseMethods(exerciseMethodResponse.data);
  }, [exerciseMethodResponse]);

  return (
    <>
      <div className="w-full flex flex-col gap-3 py-4">
        <div className="grid lg:grid-cols-2 gap-4">
          <DragDropWrapper
            items={exerciseObjs}
            setItems={(items) => {
              setExerciseObjs(items);
              handleUpdateExercises(items);
            }}
            idKey="name"
          >
            {({ item, index }) => (
              <SortableItem item={item} idKey="name">
                {() => (
                  <Card
                    key={item._id || item.name + index}
                    className={` sm:p-6 max-h-[575px] overflow-y-auto custom-scrollbar`}
                  >
                    <CardHeader>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <h2 className="font-bold underline">תרגיל:</h2>
                          {isEditable && (
                            <Button
                              variant={"ghost"}
                              onClick={() => {
                                exerciseIndexToDelete.current = index;
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <IoClose size={22} />
                            </Button>
                          )}
                        </div>
                        {isEditable ? (
                          <div className="w-fit">
                            <ComboBox
                              options={exerciseOptions}
                              value={item.name}
                              onSelect={(exercise) => handleUpdateExercise(index, exercise)}
                            />
                          </div>
                        ) : (
                          <p className="font-bold">{item.name}</p>
                        )}
                        {item.linkToVideo && (
                          <img
                            className="rounded mt-2"
                            src={getYouTubeThumbnail(extractVideoId(item.linkToVideo || ""))}
                          />
                        )}
                        <label className="font-bold underline pt-5">שיטת אימון:</label>
                        {isEditable ? (
                          <div className="w-fit flex gap-5">
                            <ComboBox
                              options={exerciseMethods}
                              value={item.exerciseMethod}
                              onSelect={(exercise) =>
                                handleUpdateWorkoutObject("exerciseMethod", exercise, index)
                              }
                            />
                            <Button
                              onClick={() =>
                                handleUpdateWorkoutObject("exerciseMethod", undefined, index)
                              }
                            >
                              נקה
                            </Button>
                          </div>
                        ) : (
                          <p className="font-bold">{item.exerciseMethod}</p>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 ">
                      <SetsContainer
                        existingSets={item.sets}
                        updateSets={(setsArr: ISet[]) => updateSets(setsArr, index)}
                      />
                      <div className=" flex flex-col gap-4">
                        <div>
                          <Label className="font-bold underline">לינק לסרטון</Label>
                          {isEditable ? (
                            <Input
                              readOnly={!isEditable}
                              placeholder="הכנס לינק כאן..."
                              name="linkToVideo"
                              value={item.linkToVideo}
                              onChange={(e) =>
                                handleUpdateWorkoutObject("linkToVideo", e.target.value, index)
                              }
                            />
                          ) : (
                            <a
                              onClick={(e) => {
                                const target = e.target as HTMLAnchorElement;
                                if (!target || !target.href || !target.href.includes("youtube")) {
                                  e.preventDefault();
                                  return;
                                }
                              }}
                              target="_blank"
                              href={item.linkToVideo}
                              className="py-1 block border-b-2 text-ellipsis break-words whitespace-normal"
                            >
                              {item.linkToVideo == `` ? `לא קיים` : item.linkToVideo}
                            </a>
                          )}
                        </div>
                        <div>
                          <Label className="font-bold underline">דגשים</Label>
                          {isEditable ? (
                            <Textarea
                              readOnly={!isEditable}
                              placeholder="דגשים למתאמן..."
                              name="tipFromTrainer"
                              value={item.tipFromTrainer}
                              onChange={(e) =>
                                handleUpdateWorkoutObject("tipFromTrainer", e.target.value, index)
                              }
                            />
                          ) : (
                            <p className="py-1 border-b-2 text-ellipsis break-words whitespace-normal">
                              {item.tipFromTrainer?.replace(" ", "").length == 0
                                ? `לא קיים`
                                : item.tipFromTrainer}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </SortableItem>
            )}
          </DragDropWrapper>
          {isEditable && (
            <div className="h-[575px]">
              <AddWorkoutPlanCard onClick={() => handleAddExcercise()} />
            </div>
          )}
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
