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
import { log } from 'console'

interface ExcerciseInputProps {
    options: string[];
    setter: React.Dispatch<React.SetStateAction<string[]>>;
    title: string;
}

interface IExcercise {
    id: number,
    name: string,
    setToDo: number,
    repsToDo: number,
    weight?: string
}


const ExcerciseInput: React.FC<ExcerciseInputProps> = ({ options, setter, title }) => {
    const [excercisesLength, setExcercisesLength] = useState(2)
    const [workoutObjs, setWorkoutObjs] = useState<IExcercise[]>([])

    const handleChange = (e, index) => {
        let name: string;
        let value: string | number;
        name = typeof (e) === `string` ? `name` : e.target.name;
        value = typeof (e) === `string` ? e : e.target.value;

        setWorkoutObjs(prevWorkouts => {
            const workoutExists = prevWorkouts.find(workout => workout.id === index);

            if (workoutExists) {
                return prevWorkouts.map(workout =>
                    workout.id === index ? { ...workout, [name]: value } : workout
                );
            } else {
                return [...prevWorkouts, { id: index, [name]: value }];
            }
        });
    }
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
                            <ComboBox
                                options={options}
                                setter={setter}
                                handleChange={handleChange}
                                index={index}
                            />
                            <div className='flex gap-5 items-end '>
                                <div>
                                    <Label>סטים</Label>
                                    <Input
                                        placeholder='1/2/3/4...'
                                        name='setToDo'
                                        onChange={(e) => handleChange(e, index)}
                                    />
                                </div>
                                <div>
                                    <Label>חזרות</Label>
                                    <Input
                                        name='repsToDo'
                                        placeholder='8/10/12...'
                                        onChange={(e) => handleChange(e, index)}
                                    />
                                </div>
                                <div>
                                    <Label>משקל</Label>
                                    <Input
                                        placeholder='KG'
                                        name='weight'
                                        onChange={(e) => handleChange(e, index)}
                                    />
                                </div>
                                <Button >שמור</Button>
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
