import React, { useState } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { BsFillTrash3Fill } from "react-icons/bs";
import { BsTrash3 } from "react-icons/bs";
import { Button } from '@/components/ui/button';
import { DialogClose } from '@radix-ui/react-dialog';

interface DeleteButtonProps {
    onClick: any
    tip: string
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, tip }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div>
            <Dialog>
                <DialogTrigger className=' flex items-center justify-center  w-8  h-full p-0'>
                    <TooltipProvider delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger className='h-full'>
                                <div
                                    onMouseEnter={(() => setIsHovered(true))}
                                    onMouseLeave={(() => setIsHovered(false))}
                                    className='flex rounded items-center justify-center w-full h-full p-1 bg-destructive '
                                >
                                    {isHovered ?
                                        <BsFillTrash3Fill />
                                        :
                                        <BsTrash3 />
                                    }
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{tip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className='text-right pr-5'>...לפני שמתקדמים</DialogTitle>
                        <DialogDescription dir='rtl' className='text-right py-2 pr-5'>
                            פעולה זו אינה ניתנת לביטול.<br></br> פעולה זו תמחק את המוצר לצמיתות ותסיר את נתוניו מהשרתים שלנו.<br></br>האם אתה בטוח שאתה רוצה להמשיך?
                        </DialogDescription>
                        <DialogFooter className='w-full flex items-end gap-4'>
                            <DialogClose>
                                <p
                                    className='underline text-md cursor-pointer hover:text-blue-500'
                                >לא, תודה</p>
                            </DialogClose>
                            <DialogClose>
                                <Button
                                    onClick={onClick}
                                    variant='destructive'
                                >כן, המשך</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default DeleteButton
