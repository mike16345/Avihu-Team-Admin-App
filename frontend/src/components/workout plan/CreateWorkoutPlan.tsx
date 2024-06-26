import React, { useState } from 'react'
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

    const [workoutPlan, setWorkoutPlan] = useState<string>(`AB`);
    const [e, setE] = useState()

    return (
        <div className='p-5 overflow-y-scroll max-h-[95vh] w-full' >
            <h1 className='text-4xl'>תוכנית אימון</h1>
            <p>
                כאן תוכל לייתר תוכנית אימון ללקוחות שלך
            </p>
            <div className='p-2'>
                <ComboBox options={workoutTemp} setter={setWorkoutPlan} />
                {workoutPlan === `AB` &&
                    <div >
                        <ExcerciseInput options={excercises} setter={setE} title='אימון A' />
                        <ExcerciseInput options={excercises} setter={setE} title='אימון B' />
                    </div>
                }
                {workoutPlan === `ABC` &&
                    <div >
                        <ExcerciseInput options={excercises} setter={setE} title='אימון A' />
                        <ExcerciseInput options={excercises} setter={setE} title='אימון B' />
                        <ExcerciseInput options={excercises} setter={setE} title='אימון C' />
                    </div>
                }
                {workoutPlan === `Daily` &&
                    <div >
                        <ExcerciseInput options={excercises} setter={setE} title='אימון A' />
                        <ExcerciseInput options={excercises} setter={setE} title='אימון B' />
                        <ExcerciseInput options={excercises} setter={setE} title='אימון C' />
                        <ExcerciseInput options={excercises} setter={setE} title='אימון D' />
                        <ExcerciseInput options={excercises} setter={setE} title='אימון E' />
                        <ExcerciseInput options={excercises} setter={setE} title='אימון F' />
                    </div>
                }
            </div>

        </div>
    )
}

export default CreateWorkoutPlan
