import React, { useContext, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import ComboBox from './ComboBox'
import { DialogClose } from '@radix-ui/react-dialog'
import { Button } from '../ui/button'
import { BiPencil } from "react-icons/bi";

interface MuscleGroupSelectorProps {
    options: string[];
    handleChange: (value: string) => void;
    existingMuscleGroup?: string
}

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({ options, handleChange, existingMuscleGroup }) => {
    const [value, setValue] = useState<string>(existingMuscleGroup ? existingMuscleGroup : ``)


    return (
        <Dialog defaultOpen={value ? false : true}>
            <DialogTrigger
                className='border-2 hover:border-black rounded py-1 px-2'
            >
                <div className='flex items-center gap-2'>
                    <p
                        className='font-bold text-md'
                    >
                        {value ? value : `לא נבחר`}
                    </p>
                    <p className='text-sm'>
                        <BiPencil />
                    </p>
                </div>
            </DialogTrigger>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader >
                    <DialogTitle dir='rtl' className='text-center underline pb-6'>בחר קבוצת שריר:</DialogTitle>
                    <DialogDescription className='flex justify-center py-4'>
                        <ComboBox options={options} handleChange={(val) => setValue(val)} />
                    </DialogDescription>
                </DialogHeader>
                <DialogClose>
                    <Button
                        className='w-full'
                        onClick={value ? () => handleChange(value) : () => { }}
                    >אישור</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}

export default MuscleGroupSelector
