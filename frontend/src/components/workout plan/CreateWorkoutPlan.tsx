import React, { useState } from "react";

import ComboBox from "./ComboBox";
import { ICompleteWorkoutPlan, IMuscleGroupWorkouts, IWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import DeleteButton from "./buttons/DeleteButton";
import AddButton from "./buttons/AddButton";
import MuscleGroupContainer from "./MuscleGroupContainer";
import { useWorkoutPlanApi } from "@/hooks/useWorkoutPlanApi";
import { cleanObject } from "@/utils/workoutPlanUtils";
import { Button } from "../ui/button";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner";


const CreateWorkoutPlan: React.FC = () => {
    const { addWorkoutPlan } = useWorkoutPlanApi()
    const workoutTemp: string[] = [`AB`, `ABC`, `Daily`, `Custom`];

    const [workoutSplit, setWorkoutSplit] = useState<string>(`AB`);
    const [workoutPlan, setWorkoutPlan] = useState<IWorkoutPlan[]>([]);

    const handleAddWorkout = () => {
        const newObject = { planName: `אימון ${workoutPlan.length + 1}`, workouts: [] };

        setWorkoutPlan([...workoutPlan, newObject]);
    };

    const handleDeleteWorkout = (name: string) => {
        const filteredArr = workoutPlan.filter((workout) => workout.planName !== name);
        const newArr = filteredArr.map((workout, i) => ({ ...workout, planName: `אימון ${i + 1}` }));

        setWorkoutPlan(newArr);
    };

    const handleSave = (split: string, workouts: IMuscleGroupWorkouts[]) => {
        setWorkoutPlan((prevWorkoutPlan) => {
            const workoutExists = prevWorkoutPlan.find((workout) => workout.planName === split);

            if (workoutExists) {
                return prevWorkoutPlan.map((workout) =>
                    workout.planName === split ? { ...workout, workouts: workouts } : workout
                );
            } else {
                return [...prevWorkoutPlan, { planName: split, workouts: workouts }];
            }
        });
    }

    const handleSelect = (splitVal: string) => {
        const initalWorkoutPlan = [];
        let iterater = 1;

        switch (splitVal) {
            case `AB`:
                iterater = 2;
                break;
            case `ABC`:
                iterater = 3;
                break;
            case `Daily`:
                iterater = 7;
                break;
            case `Custom`:
                iterater = 1;
                break;
        }

        for (let index = 1; index <= iterater; index++) {
            if (splitVal === `AB` || splitVal === `ABC`) {
                initalWorkoutPlan.push({
                    planName: `אימון ${splitVal[index - 1]}`,
                    workouts: [],
                });
            } else {
                initalWorkoutPlan.push({
                    planName: `אימון ${index}`,
                    workouts: [],
                });
            }
        }

        setWorkoutSplit(splitVal)
        setWorkoutPlan(initalWorkoutPlan);
    }


    const hanldeSubmit = async () => {
        const postObject: ICompleteWorkoutPlan = {
            userId: `665f0b0b00b1a04e8f1c4478`,
            workoutPlans: [...workoutPlan]
        }

        const cleanedPostObject = cleanObject(postObject)
        const date = new Date().toLocaleTimeString()
        try {
            const response = await addWorkoutPlan(cleanedPostObject);

            toast(`Workout Plan Saved Succesfully!`, {
                description: `${date}`
            })
        } catch (error) {
            toast(`${error.message}`, {
                description: `${error.response.data.message}`
            })
        }

    }




    return (
        <div className="p-5 overflow-y-scroll max-h-[95vh] w-full">
            <h1 className="text-4xl">תוכנית אימון</h1>
            <p>כאן תוכל לייתר תוכנית אימון ללקוחות שלך</p>
            <div className="p-2">
                <ComboBox
                    options={workoutTemp}
                    handleChange={(currentValue) => handleSelect(currentValue)}
                />

                {workoutPlan.map((workout) => (
                    <div key={workout.planName} className="flex items-start">
                        <MuscleGroupContainer
                            handleSave={(workouts) => handleSave(workout.planName, workouts)}
                            title={workout.planName}
                        />
                        {workoutSplit === `Custom` &&
                            <DeleteButton tip="הסר אימון" onClick={() => handleDeleteWorkout(workout.planName)} />
                        }
                    </div>
                ))}
                {workoutSplit === `Custom` && <AddButton tip="הוסף אימון" onClick={handleAddWorkout} />}
            </div>
            <Toaster />
            <Button onClick={hanldeSubmit}>שמור אימון</Button>
        </div >
    );
};

export default CreateWorkoutPlan;
