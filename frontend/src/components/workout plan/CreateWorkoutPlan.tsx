import React, { createContext, useEffect, useState } from "react";
import ComboBox from "./ComboBox";
import { ICompleteWorkoutPlan, IMuscleGroupWorkouts, IWorkoutPlan } from "@/interfaces/IWorkoutPlan";
import DeleteButton from "./buttons/DeleteButton";
import MuscleGroupContainer from "./MuscleGroupContainer";
import { useWorkoutPlanApi } from "@/hooks/useWorkoutPlanApi";
import { cleanWorkoutObject } from "@/utils/workoutPlanUtils";
import { Button } from "../ui/button";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner";
import { BsFillPencilFill } from "react-icons/bs";
import { BsPlusCircleFill } from "react-icons/bs";

export const EditableContext = createContext<boolean>(false);

const CreateWorkoutPlan: React.FC = () => {
    const { addWorkoutPlan, getWorkoutPlan, updateWorkoutPlan } = useWorkoutPlanApi()
    const workoutTemp: string[] = [`AB`, `ABC`, `יומי`, `התאמה אישית`];
    const [isView, setIsView] = useState<boolean>(true)
    const [isEdit, setIsEdit] = useState<boolean>(isView ? false : true)

    const [workoutSplit, setWorkoutSplit] = useState<string>();
    const [workoutPlan, setWorkoutPlan] = useState<IWorkoutPlan[]>([]);

    const handlePlanNameChange = (newName: string, index: number) => {
        const newWorkoutPlan = workoutPlan.map((workout, i) => i == index ? { ...workout, planName: newName } : workout);
        setWorkoutPlan(newWorkoutPlan);
    }

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
            case `יומי`:
                iterater = 7;
                break;
            case `התאמה אישית`:
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
        console.log(postObject);


        const cleanedPostObject = cleanWorkoutObject(postObject)
        console.log(cleanedPostObject);

        const date = new Date().toLocaleTimeString()

        if (isView) {

            updateWorkoutPlan(`665f0b0b00b1a04e8f1c4478`, cleanedPostObject)
                .then(() => toast(`Workout Plan Saved Succesfully!`, {
                    description: `${date}`
                }))
                .catch((error) => toast(`${error.message}`, {
                    description: `${error.response.data.message}`
                }))
            return
        }

        addWorkoutPlan(cleanedPostObject).
            then(() => toast(`Workout Plan Saved Succesfully!`, {
                description: `${date}`
            }))
            .catch((error) => toast(`${error.message}`, {
                description: `${error.response.data.message}`
            }))
    }

    useEffect(() => {
        if (isView) {
            getWorkoutPlan(`668a6d535eeb5c9aeff7a952`)
                .then(data => setWorkoutPlan(data.workoutPlans)
                )
        }
    }, [])




    return (
        <EditableContext.Provider value={{ isEdit }}>
            <div className="p-5 overflow-y-scroll max-h-[95vh] w-full">
                <h1 className="text-4xl">תוכנית אימון</h1>
                <p>כאן תוכל לייצר תוכנית אימון ללקוחות שלך</p>
                <div className="p-2">
                    <div className="flex justify-between">
                        <ComboBox
                            options={workoutTemp}
                            handleChange={(currentValue) => handleSelect(currentValue)}
                        />
                        {isView &&
                            <div
                                onClick={() => setIsEdit(!isEdit)}
                                className="flex items-center px-2 rounded cursor-pointer hover:bg-blue-200 bg-blue-100">
                                <BsFillPencilFill />
                            </div>
                        }
                    </div>

                    {workoutPlan.map((workout, i) => (
                        <div key={workout.planName} className="flex items-start">
                            <MuscleGroupContainer
                                workout={workout.workouts}
                                handleSave={(workouts) => handleSave(workout.planName, workouts)}
                                title={workout.planName}
                                handlePlanNameChange={(newName) => handlePlanNameChange(newName, i)}
                            />
                            <div className="mt-5 ">
                                <DeleteButton tip="הסר אימון" onClick={() => handleDeleteWorkout(workout.planName)} />
                            </div>
                        </div>
                    ))}
                    <div className="w-full flex justify-center">
                        {workoutSplit &&
                            <Button
                                onClick={handleAddWorkout}
                            >
                                <div className="flex flex-col items-center">
                                    הוסף אימון
                                    <BsPlusCircleFill />
                                </div>
                            </Button>
                        }
                    </div>
                </div>
                <Toaster />
                {isEdit &&
                    { workoutSplit &&
                    <Button onClick={hanldeSubmit}>שמור תוכנית אימון</Button>
                }
                }
            </div >
        </EditableContext.Provider>
    );
};

export default CreateWorkoutPlan;
