import React, { Fragment, useRef, useState } from "react";
import ComboBox from "./ComboBox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IExercisePresetItem, ISet, IExercise } from "@/interfaces/IWorkoutPlan";
import SetsContainer from "./SetsContainer";
import { Input } from "../ui/input";
import { IoClose } from "react-icons/io5";
import { Card, CardContent, CardHeader } from "../ui/card";
import { AddWorkoutPlanCard } from "./AddWorkoutPlanCard";
import DeleteModal from "./DeleteModal";
import useExercisePresetApi from "@/hooks/useExercisePresetApi";
import { useIsEditableContext } from "../context/useIsEditableContext";

interface ExcerciseInputProps {
  options?: string;
  updateWorkouts: (workouts: IExercise[]) => void;
  exercises?: IExercise[];
}

const ExcerciseInput: React.FC<ExcerciseInputProps> = ({ options, updateWorkouts, exercises }) => {
  const { isEditable } = useIsEditableContext();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { getExerciseByMuscleGroup } = useExercisePresetApi();
  const exerciseIndexToDelete = useRef<number | null>(null);

  const [workoutObjs, setWorkoutObjs] = useState<IExercise[]>(
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
    const updatedWorkouts = workoutObjs.map((workout, i) =>
      i === index ? { ...workout, [key]: value } : workout
    );

    setWorkoutObjs(updatedWorkouts);
    updateWorkouts(updatedWorkouts);
  };

  const handleUpdateExercise = (index: number, exercise: IExercisePresetItem) => {
    const { name, linkToVideo, tipsFromTrainer } = exercise;

    const updatedWorkouts = workoutObjs.map((workout, i) =>
      i === index
        ? { ...workout, linkToVideo, name: name, tipFromTrainer: tipsFromTrainer }
        : workout
    );

    setWorkoutObjs(updatedWorkouts);
    updateWorkouts(updatedWorkouts);
  };

  const handleAddExcercise = () => {
    const newObject: IExercise = {
      name: ``,
      sets: [
        {
          id: 1,
          minReps: 0,
          maxReps: 0,
        },
      ],
    };

    const newArr = [...workoutObjs, newObject];

    setWorkoutObjs(newArr);
    updateWorkouts(newArr);
  };

  const handleDeleteExcercise = () => {
    if (exerciseIndexToDelete.current === null) return;

    const newArr = workoutObjs.filter((_, i) => i !== exerciseIndexToDelete.current);

    setWorkoutObjs(newArr);
    updateWorkouts(newArr);
    exerciseIndexToDelete.current = null;
  };

  const updateSets = (setsArr: ISet[], index: number) => {
    const updatedWorkouts = workoutObjs.map((workout, i) => {
      if (i === index) {
        return {
          ...workout,
          sets: setsArr,
        };
      }
      return workout;
    });

    setWorkoutObjs(updatedWorkouts);
    updateWorkouts(updatedWorkouts);
  };

  return (
    <>
      <div className="w-full flex flex-col gap-3 px-2 py-4">
        <div className="grid xl:grid-cols-2 gap-4">
          {workoutObjs.map((item, i) => (
            <Fragment key={i}>
              <Card className=" p-6 max-h-[575px] overflow-y-auto custom-scrollbar">
                <CardHeader>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold underline">תרגיל:</h2>
                      {isEditable && (
                        <div
                          onClick={() => {
                            exerciseIndexToDelete.current = i;
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <IoClose className="hover:scale-105  cursor-pointer" size={22} />
                        </div>
                      )}
                    </div>
                    {isEditable ? (
                      <ComboBox
                        optionsEndpoint={options}
                        getOptions={getExerciseByMuscleGroup}
                        existingValue={item.name}
                        handleChange={(currentValue) => handleUpdateExercise(i, currentValue)}
                      />
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
