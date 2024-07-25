import { Button } from '@/components/ui/button'
import { IMuscleGroupWorkouts, IWorkoutPlan } from '@/interfaces/IWorkoutPlan';
import React, { Fragment, useEffect, useState } from 'react'
import { BsPlusCircleFill } from 'react-icons/bs';
import MuscleGroupPreset from './MuscleGroupPreset';
import { Input } from '@/components/ui/input';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useWorkoutPlanPresetApi } from '@/hooks/useWorkoutPlanPresetsApi';
import { cleanWorkoutObject } from '@/utils/workoutPlanUtils';

const WorkoutPreset = () => {
    const { id } = useParams()

    const { addWorkoutPlanPreset, getWorkoutPlanPresetById, updateWorkoutPlanPreset } = useWorkoutPlanPresetApi()

    const [workoutPlan, setWorkoutPlan] = useState<IWorkoutPlan[]>([]);
    const [presetName, setPresetName] = useState<string>()
    const [isEdit] = useState<boolean>(Boolean(id))



    const handlePlanNameChange = (newName: string, index: number) => {
        const newWorkoutPlan = workoutPlan.map((workout, i) =>
            i == index ? { ...workout, planName: newName } : workout
        );
        setWorkoutPlan(newWorkoutPlan);
    };

    const handleAddWorkout = () => {
        const newObject = { planName: `אימון ${workoutPlan.length + 1}`, workouts: [] };

        setWorkoutPlan([...workoutPlan, newObject]);
    };

    const handleDeleteWorkout = (index: number) => {
        const filteredArr = workoutPlan.filter((_, i) => i !== index);

        setWorkoutPlan(filteredArr);
    };

    const handleSave = (index: number, workouts: IMuscleGroupWorkouts[]) => {
        setWorkoutPlan((prevWorkoutPlan) => {
            const workoutExists = prevWorkoutPlan[index];

            if (workoutExists) {
                return prevWorkoutPlan.map((workout, i) =>
                    i === index ? { ...workout, workouts: workouts } : workout
                );
            } else {
                return [
                    ...prevWorkoutPlan,
                    { planName: `אימון ${workoutPlan.length + 1}`, workouts: workouts },
                ];
            }
        });
    };

    const hanldeSubmit = () => {
        if (!presetName) return
        const postObject = {
            presetName,
            workoutPlans: [...workoutPlan]
        }

        const cleanedObject = cleanWorkoutObject(postObject)
        console.log(cleanedObject);


        if (isEdit) {
            if (!id) return
            updateWorkoutPlanPreset(id, cleanedObject)
                .then(() => toast.success(`תבנית אימון נשמרה בהצלחה!`))
                .catch(err => toast.error(`אופס! נתקלנו בבעיה..`, {
                    description: err.response.data.message
                }))
        } else {
            addWorkoutPlanPreset(cleanedObject)
                .then(() => toast.success(`תבנית אימון נשמרה בהצלחה!`))
                .catch(err => toast.error(`אופס! נתקלנו בבעיה..`, {
                    description: err.response.data.message
                }))
        }
    }

    useEffect(() => {
        if (!id) return
        getWorkoutPlanPresetById(id)
            .then(res => {
                setWorkoutPlan(res.workoutPlans);
                setPresetName(res.presetName)
            })
            .catch(err => console.log(err));
    }, [])


    return (
        <div className="flex flex-col gap-4 p-5 overflow-y-scroll hide-scrollbar w-5/6 max-h-[95vh] ">
            <h1 className="text-5xl">תבנית אימון</h1>
            <p>
                {isEdit ?
                    `כאן תוכל לערוך תבנית אימון קיימת`
                    :
                    `  כאן תוכל ליצור תבנית אימון חדשה`
                }
            </p>
            <div className="p-2 py-4">
                <div className='w-72 py-4 border-b-2 mb-2'>
                    <h2
                        className='font-bold underline pb-3'
                    >שם התבנית:</h2>
                    <Input
                        placeholder='שם...'
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                    />
                </div>


                {workoutPlan.map((workout, i) => (
                    <Fragment key={i} >
                        <MuscleGroupPreset
                            workout={workout.workouts}
                            handleSave={(workouts) => handleSave(i, workouts)}
                            title={workout.planName}
                            handlePlanNameChange={(newName) => handlePlanNameChange(newName, i)}
                            handleDeleteWorkout={() => handleDeleteWorkout(i)}
                        />
                    </Fragment>
                ))}
                <div className="w-full flex items-center justify-center">
                    <Button onClick={handleAddWorkout}>
                        <div className="flex flex-col items-center font-bold">
                            הוסף אימון
                            <BsPlusCircleFill />
                        </div>
                    </Button>
                </div>
            </div>
            <div className='flex justify-end'>
                <Button
                    onClick={hanldeSubmit}
                    variant='success'
                >שמור תוכנית אימון</Button>
            </div>
        </div>
    )
}

export default WorkoutPreset