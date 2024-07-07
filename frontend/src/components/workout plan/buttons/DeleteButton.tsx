import React from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { BsFillTrash3Fill } from "react-icons/bs";

interface DeleteButtonProps {
    onClick: any
    tip: string
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onClick, tip }) => {

    return (
        <div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className='h-full'>
                        <div
                            onClick={onClick}
                            className='flex rounded items-center justify-center w-full h-full m-1 bg-red-50 hover:bg-red-200'
                        >
                            <BsFillTrash3Fill />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

export default DeleteButton
