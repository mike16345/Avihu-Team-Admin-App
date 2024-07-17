import React, { useState } from 'react'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AddSheetProps {
    prompt?: string
    saveItem: (item: string) => void
}

const AddSheet: React.FC<AddSheetProps> = ({ prompt, saveItem }) => {

    const [newItem, setNewItem] = useState<string | undefined>()

    const saveChange = () => {
        if (!newItem) return
        saveItem(newItem)
        setNewItem(undefined)
    }

    return (
        <Sheet>
            <SheetTrigger
                className='bg-primary my-2 p-1 px-2 rounded hover:bg-accent hover:text-primary text-accent border-2 border-primary'
            >{prompt}</SheetTrigger>
            <SheetContent side='left' dir='rtl'>
                <SheetHeader>
                    <SheetTitle className='text-center text-3xl'>{prompt}</SheetTitle>
                    <SheetDescription className='pt-3 text-right'>
                        כאן ניתן להוסיף פריטים לרשימה הקיימת במערכת.
                    </SheetDescription>
                    <div className='w-full flex flex-col gap-4 py-4'>
                        <Input
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
