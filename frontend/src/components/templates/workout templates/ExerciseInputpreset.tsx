import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ComboBox from '@/components/workout plan/ComboBox';
import DeleteModal from '@/components/workout plan/DeleteModal';
import { ISet, IWorkout } from '@/interfaces/IWorkoutPlan';
import React, { useState } from 'react'
import SetsContainerPreset from './SetsContainerPreset';

interface ExcerciseInputPresetProps {
    options: string[] | undefined;
    updateWorkouts: (workouts: IWorkout[]) => void;
    exercises?: IWorkout[];
}

const ExerciseInputpreset: React.FC<ExcerciseInputPresetProps> = ({ options, updateWorkouts, exercises }) => {
    const [workoutObjs, setWorkoutObjs] = useState<IWorkout[]>(exercises || [
        {
            id: `1`,
            name: ``,
            sets: [],
        },
    ]);

    const handleChange = (
        e: string | React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
        index: number
    ) => {
        const name = typeof e === `string` ? `name` : e.target.name;
        const value = typeof e === `string` ? e : e.target.value;

        const updatedWorkouts = workoutObjs.map((workout, i) =>
            i === index ? { ...workout, [name]: value } : workout
        );

        setWorkoutObjs(updatedWorkouts);
        updateWorkouts(updatedWorkouts)
    };

    const handleAddExcercise = () => {
        const newObject: IWorkout = {
            id: (workoutObjs.length + 1).toString(),
            name: ``,
            sets: [],
        };

        const newArr = [...workoutObjs, newObject];

        setWorkoutObjs(newArr);
        updateWorkouts(newArr);
    };

    const handleDeleteExcercise = (index: number) => {
        const newArr = workoutObjs.filter((_, i) => i !== index);

        setWorkoutObjs(newArr);
        updateWorkouts(newArr);
    };

    const updateSets = (setsArr: ISet[], index: number) => {

        const updatedWorkouts = workoutObjs.map((workout, i) => {

            if (i === index) {
                return {
                    ...workout,
                    sets: setsArr
                };
            }
            return workout;
        });

        setWorkoutObjs(updatedWorkouts)
        updateWorkouts(updatedWorkouts)

    };



    return (
        <div className="w-full">
            {workoutObjs.map((item, i) => (
                <div className="py-5 flex  gap-2 " key={i}>

                    <div className="flex flex-col gap-5 border-b-2 w-full p-2">
                        <div className="flex justify-between items-end">
                            <h2 className="font-bold underline">בחר תרגיל:</h2>
                            <DeleteModal
                                child={
                                    <Button
                                        variant="outline"
                                        className=" hover:border-destructive h-0 py-4"
                                    > מחק תרגיל</Button>
                                }
                                onClick={() => handleDeleteExcercise(i)}
                            />

                        </div>
                        <ComboBox
                            options={options}
                            existingValue={item.name}
                            handleChange={(currentValue) => handleChange(currentValue, i)}
                        />
                        <SetsContainerPreset
                            existingSets={item.sets}
                            updateSets={(setsArr: ISet[]) => updateSets(setsArr, i)}
                        />

                        <div className="w-[40%]">
                            <Label className="font-bold underline">לינק לסרטון</Label>
                            <Input
                                placeholder="הכנס לינק כאן..."
                                name="linkToVideo"
                                value={item.linkToVideo}
                                onChange={(e) => handleChange(e, i)}
                            />
                        </div>
                        <div className="w-[40%]">
                            <Label className="font-bold underline">דגשים</Label>
                            <Textarea
                                placeholder="דגשים למתאמן..."
                                name="tipFromTrainer"
                                value={item.tipFromTrainer}
                                onChange={(e) => handleChange(e, i)}
                            />
                        </div>
                    </div>
                </div>
            ))
            }
            <Button className="text-[12px] p-1 mr-5 my-2" onClick={handleAddExcercise}>
                הוסף תרגיל
            </Button>
        </div >
    )
}

export default ExerciseInputpreset
