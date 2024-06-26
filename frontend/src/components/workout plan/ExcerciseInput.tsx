import React, { useState } from 'react'
import ComboBox from './ComboBox'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown } from "lucide-react"
import { Button } from '../ui/button'




const ExcerciseInput = ({ options, setter, title }) => {
    const [excercisesLength, setExcercisesLength] = useState(2)
    return (
        <div className='border-b-2 py-2 w-[70%]'>
            <Collapsible>
                <CollapsibleTrigger className='flex items-center'>
                    {title}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    {Array.from({ length: excercisesLength }).map((item, index) => (
                        <div className='py-5 flex items-end gap-5' key={index}>
                            <ComboBox options={options} setter={setter} />
                            <div className='flex gap-5 items-end '>
                                <div>
                                    <Label>סטים</Label>
                                    <Input
                                        placeholder='1/2/3/4...'
                                    />
                                </div>
                                <div>
                                    <Label>חזרות</Label>
                                    <Input
                                        placeholder='8/10/12...'
                                    />
                                </div>
                                <div>
                                    <Label>משקל</Label>
                                    <Input
                                        placeholder='KG'
                                    />
                                </div>
                                <Button >הסר</Button>
                            </div>
                        </div>
                    ))}
                    <Button
                        onClick={() => setExcercisesLength(excercisesLength + 1)}
                    >הוסף תרגיל</Button>

                </CollapsibleContent>
            </Collapsible>


        </div>
    )
}

export default ExcerciseInput
