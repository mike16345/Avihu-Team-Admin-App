import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ComboBox from '@/components/workout plan/ComboBox';
import DeleteModal from '@/components/workout plan/DeleteModal';
import { IExercisePresetItem, ISet, IWorkout } from '@/interfaces/IWorkoutPlan';
import React, { useRef, useState } from 'react'
import SetsContainerPreset from './SetsContainerPreset';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { IoClose } from 'react-icons/io5';
import { AddWorkoutPlanCard } from '@/components/workout plan/AddWorkoutPlanCard';
import useExercisePresetApi from '@/hooks/useExercisePresetApi';

interface ExcerciseInputPresetProps {
    options: string | undefined;
    updateWorkouts: (workouts: IWorkout[]) => void;
    exercises?: IWorkout[];
}

const ExerciseInputpreset: React.FC<ExcerciseInputPresetProps> = ({ options, updateWorkouts, exercises }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const exerciseIndexToDelete = useRef<number | null>(null);
    const { getExerciseByMuscleGroup } = useExercisePresetApi()


    const [workoutObjs, setWorkoutObjs] = useState<IWorkout[]>(
        exercises || [
            {
                id: `1`,
                name: ``,
                sets: [],
            },
        ]
    );


    const handleUpdateWorkoutObject = <K extends keyof IWorkout>(
        key: K,
        value: IWorkout[K],
        index: number
    ) => {
        const updatedWorkouts = workoutObjs.map((workout, i) =>
            i === index ? { ...workout, [key]: value } : workout
        );

        setWorkoutObjs(updatedWorkouts);
        updateWorkouts(updatedWorkouts);
    };

    const handleUpdateExercise = (index: number, exercise: IExercisePresetItem) => {
        const { itemName, linkToVideo, tipsFromTrainer } = exercise

        const updatedWorkouts = workoutObjs.map((workout, i) =>
            i === index ? { ...workout, linkToVideo, name: itemName, tipFromTrainer: tipsFromTrainer } : workout
        )

        setWorkoutObjs(updatedWorkouts);
        updateWorkouts(updatedWorkouts);
    }

    const handleAddExcercise = () => {
        const newObject: IWorkout = {
            id: (workoutObjs.length + 1).toString(),
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
                <div className="grid grid-cols-2 gap-4">
                    {workoutObjs.map((item, i) => (
                        <>
                            <Card
                                key={i}
                                className=" px-3 py-2 border-b-2 last:border-b-0  max-h-[550px] overflow-y-auto custom-scrollbar"
                            >
                                <CardHeader className="">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <h2 className="font-bold underline">תרגיל:</h2>
                                            <div
                                                onClick={() => {
                                                    exerciseIndexToDelete.current = i;
                                                    setIsDeleteModalOpen(true);
                                                }}
                                            >
                                                <IoClose className="hover:scale-105  cursor-pointer" size={22} />
                                            </div>
                                        </div>
                                        <ComboBox
                                            optionsEndpoint={options}
                                            getOptions={getExerciseByMuscleGroup}
                                            existingValue={item.name}
                                            handleChange={(selectedValue) =>
                                                handleUpdateExercise(i, selectedValue)
                                            }
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2 ">
                                    <SetsContainerPreset
                                        existingSets={item.sets}
                                        updateSets={(setsArr: ISet[]) => updateSets(setsArr, i)}
                                    />
                                    <div className=" flex flex-col gap-1">
                                        <div>
                                            <Label className="font-bold underline">לינק לסרטון</Label>
                                            <Input
                                                placeholder="הכנס לינק כאן..."
                                                name="linkToVideo"
                                                value={item.linkToVideo}
                                                onChange={(e) =>
                                                    handleUpdateWorkoutObject("linkToVideo", e.target.value, i)
                                                }
                                            />
                                        </div>
                                        <div>
                                            <Label className="font-bold underline">דגשים</Label>
                                            <Textarea
                                                placeholder="דגשים למתאמן..."
                                                name="tipFromTrainer"
                                                value={item.tipFromTrainer}
                                                onChange={(e) =>
                                                    handleUpdateWorkoutObject("tipFromTrainer", e.target.value, i)
                                                }
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ))}
                    <div className="h-[550px]">
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
    )
}

export default ExerciseInputpreset
