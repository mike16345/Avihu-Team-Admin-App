import React, { useState } from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { BsFillTrash3Fill } from "react-icons/bs";
import { BsTrash3 } from "react-icons/bs";

interface DeleteButtonProps {
    tip: string
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ tip }) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger className='h-full'>
                    <div
                        onMouseEnter={(() => setIsHovered(true))}
                        onMouseLeave={(() => setIsHovered(false))}
                        className='flex rounded items-center justify-center w-full h-full p-1 hover:bg-accent '
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
    )
}

export default DeleteButton
