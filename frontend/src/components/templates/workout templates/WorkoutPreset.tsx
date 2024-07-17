import { Button } from '@/components/ui/button'
import { IMuscleGroupWorkouts, IWorkoutPlan } from '@/interfaces/IWorkoutPlan';
import React, { useState } from 'react'
import { BsPlusCircleFill } from 'react-icons/bs';
import MuscleGroupPreset from './MuscleGroupPreset';
import { Input } from '@/components/ui/input';

const WorkoutPreset = () => {

    const [workoutPlan, setWorkoutPlan] = useState<IWorkoutPlan[]>([]);
    const [presetName, setPresetName] = useState<string>()


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

    const hanldeSubmit = () => { }


    return (
        <div className="p-5 overflow-y-scroll hide-scrollbar max-h-[95vh] w-full">
            <h1 className="text-5xl">תבנית אימון</h1>
            <p>
                כאן תוכל לערוך תבנית אימון
            </p>
            <div className="p-2 py-4">
                <div className='w-72 py-4 border-b-2 mb-2'>
                    <h2
                        className='font-bold underline pb-3'
                    >שם התבנית:</h2>
                    <Input
                        placeholder='שם...'
                        onChange={(e) => setPresetName(e.target.value)}
                    />
                </div>


                {workoutPlan.map((workout, i) => (
                    <div key={i} className="flex items-start">
                        <MuscleGroupPreset
                            workout={workout.workouts}
                            handleSave={(workouts) => handleSave(i, workouts)}
                            title={workout.planName}
                            handlePlanNameChange={(newName) => handlePlanNameChange(newName, i)}
                            handleDeleteWorkout={() => handleDeleteWorkout(i)}
                        />
                    </div>
                ))}
                <div className="w-full flex justify-center">
                    <Button onClick={handleAddWorkout}>
                        <div className="flex flex-col items-center">
                            הוסף אימון
                            <BsPlusCircleFill />
                        </div>
                    </Button>
                </div>
            </div>
            <Button onClick={hanldeSubmit}>שמור תוכנית אימון</Button>
        </div>
    )
}

export default WorkoutPreset
