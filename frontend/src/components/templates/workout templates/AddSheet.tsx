import React, { useState } from 'react'
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



const AddSheet = () => {
    const navigate = useNavigate()
    const { type, id } = useParams()

    const [newItem, setNewItem] = useState<string | undefined>(id)
    const [isEdit, setIsEdit] = useState<boolean>(Boolean(id))


    const saveChange = () => {
        if (!newItem) return
        /* saveItem(newItem)
        setNewItem(undefined) */
        if (isEdit) {
            toast(`this will be a PUT to endpoint: ${type}`)
        } else {
            toast(`this will be a POST to endpoint: ${type}`)
        }
    }

    return (
        <Sheet defaultOpen onOpenChange={() => navigate(`/workoutPlans`)}>
            <SheetContent side='left' dir='rtl'>
                <SheetHeader>
                    <SheetTitle className='text-center text-3xl'>
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

export default AddSheet
