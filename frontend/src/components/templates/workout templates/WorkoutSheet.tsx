import React, { useEffect, useState } from 'react'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import useExercisePresetApi from '@/hooks/useExercisePresetApi'




const WorkoutSheet = () => {
    const navigate = useNavigate()
    const { type, id } = useParams()
    const { getExerciseById, updateExercise, addExercise } = useExercisePresetApi()

    const [newItem, setNewItem] = useState<string | undefined>()
    const [isEdit, setIsEdit] = useState<boolean>(Boolean(id))

    useEffect(() => {
        if (!id) return
        if (type === `exercises`) {
            getExerciseById(id)
                .then(res => setNewItem(res.itemName))
                .catch(err => console.log(err))
        }

    }, [])


    const saveChange = () => {
        if (!newItem) return
        const workoutItem = { itemName: newItem }

        if (type === `exercises`) {
            if (isEdit) {
                if (!id) return

                updateExercise(id, workoutItem)
                    .then(() => toast.success(`פריט עודכן בהצלחה!`))
                    .catch(err => toast.error(`אופס! נתקלנו בבעיה`,
                        { description: err.response.data }
                    ))

            } else {
                addExercise(workoutItem)
                    .then(() => toast.success(`פריט נשמר בהצלחה!`))
                    .catch(err => toast.error(`אופס! נתקלנו בבעיה`,
                        { description: err.response.data }
                    ))
            }
        }

    }

    return (
        <Sheet defaultOpen onOpenChange={() => navigate(`/workoutPlans`)}>
            <SheetContent dir='rtl'>
                <SheetHeader>
                    <SheetTitle className='text-right text-3xl pt-4'>
                        {type === `muscleGroups` ? `קבוצת שריר` : `תרגיל`}
                    </SheetTitle>
                    <SheetDescription className='pt-3 text-right'>
                        {isEdit ?
                            `כאן ניתן לערך פריט קיים במערכת.`
                            :
                            ` כאן ניתן להוסיף פריטים לרשימה הקיימת במערכת.`
                        }
                    </SheetDescription>
                    <div className='w-full flex flex-col gap-4 py-4'>
                        <Input
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            placeholder='פריט חדש...'
                        />
                        <SheetClose
                            disabled={!Boolean(newItem)}
                        >
                            <Button
                                disabled={!Boolean(newItem)}
                                onClick={saveChange}
                                className='w-full'
                            >שמירה</Button>
                        </SheetClose>
                    </div>
                </SheetHeader>
            </SheetContent>
        </Sheet>

    )
}

export default WorkoutSheet
