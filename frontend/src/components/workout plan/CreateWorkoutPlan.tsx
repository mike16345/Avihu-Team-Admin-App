import React, { useEffect, useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
    SheetFooter
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import ComboBox from './ComboBox'
import ExcerciseInput from './ExcerciseInput'



const CreateWorkoutPlan: React.FC = () => {

    const workoutTemp: string[] = [`AB`, `ABC`, `Daily`, `Custom`];
    const excercises: string[] = [`לחיצת חזה`, `פרפר`, `תחתונים`, `סקוואט`];

    const [workoutSplit, setWorkoutSplit] = useState<string>(`AB`);
    const [workoutPlan, setWorkoutPlan] = useState([])

    const handleSave = (split, workouts) => {

        setWorkoutPlan(prevWorkoutPlan => {
            const workoutExists = prevWorkoutPlan.find(workout => workout.name === split);

            if (workoutExists) {
                return prevWorkoutPlan.map(workout =>
                    workout.name === split ? { ...workout, workouts: workouts } : workout
                );
            } else {
                return [...prevWorkoutPlan, { name: split, workouts: workouts }];
            }
        })
    }

    useEffect(() => {
        setWorkoutPlan([]);
    }, [workoutSplit])

    return (
        <div className='p-5 overflow-y-scroll max-h-[95vh] w-full' >
            <h1 className='text-4xl'>תוכנית אימון</h1>
            <p>
                כאן תוכל לייתר תוכנית אימון ללקוחות שלך
            </p>
            <div className='p-2'>
                <ComboBox options={workoutTemp} setter={setWorkoutSplit} />
                {workoutSplit === `AB` &&
                    <div >
                        <ExcerciseInput options={excercises} handleSave={handleSave} title='אימון A' />
                        <ExcerciseInput options={excercises} handleSave={handleSave} title='אימון B' />
                    </div>
                }
                {workoutSplit === `ABC` &&
                    <div >
                        <ExcerciseInput options={excercises} handleSave={handleSave} title='אימון A' />
                        <ExcerciseInput options={excercises} handleSave={handleSave} title='אימון B' />
                        <ExcerciseInput options={excercises} handleSave={handleSave} title='אימון C' />
                    </div>
                }
                {workoutSplit === `Daily` &&
                    <div >
                        <ExcerciseInput options={excercises} handleSave={handleSave} title='אימון A' />
                        <ExcerciseInput options={excercises} handleSave={handleSave} title='אימון B' />
                        <ExcerciseInput options={excercises} handleSave={handleSave} title='אימון C' />
                        <ExcerciseInput options={excercises} handleSave={handleSave} title='אימון D' />
                        <ExcerciseInput options={excercises} handleSave={handleSave} title='אימון E' />
                        <ExcerciseInput options={excercises} handleSave={handleSave} title='אימון F' />
                    </div>
                }
            </div>

        </div>
    )
}

export default CreateWorkoutPlan
