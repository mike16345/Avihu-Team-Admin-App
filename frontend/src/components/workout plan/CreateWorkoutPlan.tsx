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



const CreateWorkoutPlan = () => {

    const workoutTemp = [`AB`, `ABC`, `Daily`, `Custom`];
    const excercises = [`לחיצת חזה`, `פרפר`, `תחתונים`, `סקוואט`];

    const [workoutPlan, setWorkoutPlan] = useState();
    const [e, setE] = useState()

    return (
        <div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">Open</Button>
                </SheetTrigger>
                <SheetContent dir='rtl' className='overflow-y-scroll'>
                    <SheetHeader>
                        <SheetTitle className='text-right'>תוכנית אימון</SheetTitle>
                        <SheetDescription className='text-right'>
                            כאן תוכל לבנות ללקוח שלך את תוכנית האימון
                        </SheetDescription>
                    </SheetHeader>
                    <ComboBox options={workoutTemp} setter={setWorkoutPlan} />
                    {workoutPlan === `AB` &&
                        <div>
                            <h2>אימון A</h2>
                            <ExcerciseInput options={excercises} setter={setE} />
                            <ExcerciseInput options={excercises} setter={setE} />
                            <ExcerciseInput options={excercises} setter={setE} />

                            <h2>אימון B</h2>
                            <ExcerciseInput options={excercises} setter={setE} />
                            <ExcerciseInput options={excercises} setter={setE} />
                            <ExcerciseInput options={excercises} setter={setE} />
                        </div>
                    }
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="submit">Save changes</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default CreateWorkoutPlan
