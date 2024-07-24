import React, { useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import ExerciseForm from '@/components/forms/ExerciseForm'



interface PresetSheetProps {
    form: string;
    id?: string;
    setForm: React.Dispatch<React.SetStateAction<string | undefined>>
    setId: React.Dispatch<React.SetStateAction<string | undefined>>
}


const PresetSheet: React.FC<PresetSheetProps> = ({ form, id, setForm, setId }) => {
    const closeSheet = () => {
        setForm(undefined);
        setId(undefined)
    }


    return (
        <Sheet defaultOpen onOpenChange={() => closeSheet()}>
            <SheetContent dir='rtl'>
                <SheetHeader>
                    <SheetTitle className='text-right text-3xl pt-4'>
                        הוסף פריט
                    </SheetTitle>
                    <SheetDescription className='pt-3 text-right'>
                        כאן ניתן להוסיף פריטים לרשימה הקיימת במערכת
                    </SheetDescription>
                    {form == `Exercise` &&
                        <ExerciseForm objectId={id} />
                    }
                </SheetHeader>
            </SheetContent>
        </Sheet>

    )
}

export default PresetSheet
