import React from 'react'
import { Button } from "../../ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface AddButtonProps {
    onClick: any
    tip: string
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, tip }) => {
    return (
        <div
            className=' bg-accent rounded border-t-2  flex justify-center p-1 my-2 cursor-pointer'
            onClick={onClick}
        >
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            className="text-sm rounded-full h-5 bg-success hover:bg-success hover:font-bold  text-secondary-foreground"

                        >
                            +
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>


        </div>
    )
}

export default AddButton
