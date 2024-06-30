import React from 'react'
import { Button } from "../../ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


interface AddButtonProps {
    clickFunction: any
    tip: string
}

const AddButton: React.FC<AddButtonProps> = ({ clickFunction, tip }) => {
    return (
        <div className=' bg-slate-100 rounded border-t-2 flex justify-center p-1 my-2'>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            className="text-sm rounded-full h-5 bg-green-500"
                            onClick={clickFunction}
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
