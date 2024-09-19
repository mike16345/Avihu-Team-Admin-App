import React, { Fragment, useRef, useState } from "react";
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
import { convertItemsToOptions, createRetryFunction } from "@/lib/utils";
import ComboBox from "../ui/combo-box";

interface ExcerciseInputProps {
  muscleGroup?: string;
  updateWorkouts: (workouts: IExercise[]) => void;
  exercises?: IExercise[];
}

const ExcerciseInput: React.FC<ExcerciseInputProps> = ({
  muscleGroup,
  updateWorkouts,
  exercises,
}) => {
  const { isEditable } = useIsEditableContext();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { getExerciseByMuscleGroup } = useExercisePresetApi();
  const exerciseIndexToDelete = useRef<number | null>(null);

  const doQuery = !!muscleGroup && isEditable;
  const exerciseQuery = useQuery({
    queryKey: [`exercise-${muscleGroup}`],
    queryFn: () => getExerciseByMuscleGroup(muscleGroup!).then((res) => res.data),
    enabled: !!muscleGroup && isEditable,
    retry: createRetryFunction(404),
  });

  const exerciseOptions = convertItemsToOptions(exerciseQuery.data || [], "name");

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
    const updatedWorkouts = exerciseObjs.map((workout, i) =>
      i === index ? { ...workout, [key]: value } : workout
    );

    setExerciseObjs(updatedWorkouts);
    updateWorkouts(updatedWorkouts);
  };

  const handleUpdateExercise = (index: number, updatedExercise: IExercisePresetItem) => {
    setExerciseObjs((prevExercises) => {
      const updatedWorkouts = [...prevExercises];
      updatedWorkouts[index] = { ...prevExercises[index], ...updatedExercise };

      updateWorkouts(updatedWorkouts);
      return updatedWorkouts;
    });
  };

  const handleAddExcercise = () => {
    const newObject: IExercise = {
      name: ``,
      sets: [
        {
          minReps: 0,
          maxReps: 0,
        },
      ],
    };

    const newArr = [...exerciseObjs, newObject];

    setExerciseObjs(newArr);
    updateWorkouts(newArr);
  };

  const handleDeleteExcercise = () => {
    if (exerciseIndexToDelete.current === null) return;

    const newArr = exerciseObjs.filter((_, i) => i !== exerciseIndexToDelete.current);

    setExerciseObjs(newArr);
    updateWorkouts(newArr);
    exerciseIndexToDelete.current = null;
  };

  const updateSets = (setsArr: ISet[], index: number) => {
    setExerciseObjs((prevExercises) => {
      const updatedWorkouts = [...prevExercises];
      updatedWorkouts[index] = {
        ...prevExercises[index],
        sets: setsArr,
      };

      updateWorkouts(updatedWorkouts);
      return updatedWorkouts;
    });
  };

  return (
    <>
      <div className="w-full flex flex-col gap-3 px-2 py-4">
        <div className="grid xl:grid-cols-2 gap-4">
          {exerciseObjs.map((item, i) => (
            <Fragment key={item._id || item.name + i}>
              <Card className=" p-6 max-h-[575px] overflow-y-auto custom-scrollbar">
                <CardHeader>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold underline">תרגיל:</h2>
                      {isEditable && (
                        <Button
                          variant={"ghost"}
                          onClick={() => {
                            exerciseIndexToDelete.current = i;
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
                          onSelect={(currentValue) => handleUpdateExercise(i, currentValue)}
                        />
                      </div>
                    ) : (
                      <p className="font-bold">{item.name}</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 ">
                  <SetsContainer
                    existingSets={item.sets}
                    updateSets={(setsArr: ISet[]) => updateSets(setsArr, i)}
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
                            handleUpdateWorkoutObject("linkToVideo", e.target.value, i)
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
                            handleUpdateWorkoutObject("tipFromTrainer", e.target.value, i)
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
            </Fragment>
          ))}
          {isEditable && (
            <div className="h-[550px]">
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
