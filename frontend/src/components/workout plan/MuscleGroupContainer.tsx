import React, { useEffect, useState } from 'react'
import ComboBox from './ComboBox'
import ExcerciseInput from './ExcerciseInput'
import { IMuscleGroupWorkouts, IWorkout } from '@/interfaces/IWorkoutPlan'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import AddButton from './buttons/AddButton';

const muscleGroups: string[] = ["חזה", "כתפיים", "יד אחורית", "גב", "יד קידמית", "רגליים", "בטן", "אירובי",];
const chestExercises: string[] = ["פרפר", "מקבילים", "לחיצת חזה בשיפוע שלילי", "לחיצת חזה בשיפוע חיובי", "לחיצת חזה",];
const shoulderExercises: string[] = ["כתפיים"];


interface MuscleGroupContainerProps {
    handleSave: (workouts: IWorkout[]) => void
    title: string
}



const MuscleGroupContainer: React.FC<MuscleGroupContainerProps> = ({ handleSave, title }) => {

    const [workouts, setWorkouts] = useState<IMuscleGroupWorkouts[]>([
        { muscleGroup: ``, exercises: [] }
    ])

    const addWorkout = () => {
        const newObject: IMuscleGroupWorkouts = {
            muscleGroup: ``,
            exercises: []
        }
        setWorkouts([...workouts, newObject])
    }

    const updateWorkouts = (i: number, workoutsObject: IWorkout[]) => {

        const updatedWorkouts = [...workouts]
        updatedWorkouts[i] = {
            ...workouts[i],
            exercises: workoutsObject
        }

        setWorkouts(updatedWorkouts);
    }

    const updateMuscleGroup = (i: number, value: string) => {

        const updatedWorkouts = [...workouts]
        updatedWorkouts[i] = {
            ...workouts[i],
            muscleGroup: value
        }

        setWorkouts(updatedWorkouts);
    }


    useEffect(() => {
        handleSave(workouts)
    }, [workouts])


    return (
        <div className='border-y-8 py-2 my-1 w-full'>
            <Collapsible>
                <CollapsibleTrigger className="flex items-center font-bold text-lg pr-5">
                    {title}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    {workouts.map((workout, i) => (
                        <div key={workout.muscleGroup} className='border-y-4'>
                            <h1 className='underline font-bold py-2'>בחר שריר:</h1>
                            <ComboBox options={muscleGroups} handleChange={(value) => updateMuscleGroup(i, value)} />
                            <div className='border-y-2 my-2'>
                                <ExcerciseInput
                                    options={workout.muscleGroup === `חזה` ? chestExercises : shoulderExercises}
                                    updateWorkouts={(workouts) => updateWorkouts(i, workouts)}
                                    title={workout.muscleGroup}
                                />
                            </div>
                        </div>
                    ))}
                    <AddButton tip='הוסף שריר' onClick={addWorkout} />
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

export default MuscleGroupContainer
