import React, { useEffect, useState } from 'react'
import ComboBox from './ComboBox'
import ExcerciseInput from './ExcerciseInput'
import { IWorkout } from '@/interfaces/IWorkoutPlan'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import AddButton from './buttons/AddButton';

const muscleGroups: string[] = ["חזה", "כתפיים", "יד אחורית", "גב", "יד קידמית", "רגליים", "בטן", "אירובי",];
const chestExercises: string[] = ["פרפר", "מקבילים", "לחיצת חזה בשיפוע שלילי", "לחיצת חזה בשיפוע חיובי", "לחיצת חזה",];
const shoulderExercises: string[] = ["כתפיים"];
const tricepExercises: string[] = ["יד אחורית"];


interface MuscleGroupContainerProps {
    handleSave: (workouts: IWorkout[]) => void
    title: string
}


const MuscleGroupContainer: React.FC<MuscleGroupContainerProps> = ({ handleSave, title }) => {

    const [workouts, setWorkouts] = useState<string[]>([`1`])
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>();
    const [exercises, setExercises] = useState<string[] | undefined>()

    /*   const updateWorkouts = (workoutId: string, workoutObjects) => {
          setWorkouts(prevWorkouts => {
              return prevWorkouts.map(workout => {
                  if (workout.id == workoutId) {
                      return workoutObjects
                  }
                  return workout
              })
          })
      } */

    useEffect(() => {
        if (selectedMuscleGroup) {
            switch (selectedMuscleGroup) {
                case `חזה`:
                    setExercises(chestExercises)
                    break;
                case `כתפיים`:
                    setExercises(shoulderExercises)
                    break;
                case `יד אחורית`:
                    setExercises(tricepExercises)
                    break;

            }
        }
    }, [selectedMuscleGroup])

    /*  useEffect(() => {
         handleSave(workouts)
     }, [workouts]) */


    return (
        <div className='border-y-8 py-2 my-1 w-full'>
            <Collapsible>
                <CollapsibleTrigger className="flex items-center font-bold text-lg pr-5">
                    {title}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    {workouts.map(workout => (
                        <div className='border-y-4'>
                            <h1 className='underline font-bold py-2'>בחר שריר:</h1>
                            <ComboBox options={muscleGroups} handleChange={setSelectedMuscleGroup} />
                            {exercises &&
                                <div className='border-y-2 my-2'>
                                    <ExcerciseInput
                                        options={exercises}
                                        updateWorkouts={(workouts) => handleSave(workouts)}
                                        title={selectedMuscleGroup}
                                    />
                                </div>
                            }
                        </div>
                    ))}
                    <AddButton onClick={() => setWorkouts([...workouts, (workouts.length + 1).toString()])} />
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

export default MuscleGroupContainer
