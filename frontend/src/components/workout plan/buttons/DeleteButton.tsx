import React from 'react'
import { Button } from "../../ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface DeleteButtonProps {
    clickFunction: any
    tip: string
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ clickFunction, tip }) => {
    return (
        <div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            onClick={clickFunction}
                            className='rounded-full h-6 bg-red-500'
                        >-</Button>
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
