import React, { useEffect, useState } from 'react'
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
import { Textarea } from "@/components/ui/textarea"
import { log } from 'console'


interface ExcerciseInputProps {
    options: string[];
    setter: React.Dispatch<React.SetStateAction<string[]>>;
    title: string;
}

interface IExcercise {
    id: number,
    name?: string,
    setToDo?: number,
    repsToDo?: number,
    tipFromTrainer?: string
}


const ExcerciseInput: React.FC<ExcerciseInputProps> = ({ options, handleSave, title }) => {
    const [workoutObjs, setWorkoutObjs] = useState<IExcercise[]>([
        {
            id: 1,
            name: undefined,
            setToDo: undefined,
            repsToDo: undefined,
            tipFromTrainer: undefined
        }
    ])
    const [s, setS] = useState()

    const handleChange = (e, index) => {
        const name = typeof (e) === `string` ? `name` : e.target.name;
        const value = typeof (e) === `string` ? e : e.target.value;

        setWorkoutObjs(prevWorkouts => {
            return prevWorkouts.map(workout =>
                workout.id === index ? { ...workout, [name]: value } : workout
            );
        });
    };

    const handleAddExcercise = () => {
        const newObject = {
            id: workoutObjs.length + 1,
            name: undefined,
            setToDo: undefined,
            repsToDo: undefined,
            tipFromTrainer: undefined
        }

        setWorkoutObjs([...workoutObjs, newObject]);
    }

    const handleDeleteExcercise = (workoutId) => {
        const newArr = workoutObjs.filter(workout => workout.id !== workoutId)

        setWorkoutObjs(newArr)
    }

    return (
        <div className='border-b-2 py-2 w-[70%]'>
            <Collapsible>
                <CollapsibleTrigger className='flex items-center'>
                    {title}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    {workoutObjs.map(item => (
                        <div className='py-5 flex items-center gap-5 border-b-4' key={item.id}>
                            <div className='flex flex-col gap-5'>
                                <div className='flex gap-5 items-end'>
                                    <ComboBox
                                        options={options}
                                        setter={setS}
                                        handleChange={handleChange}
                                        index={item.id}
                                    />

                                    <div>
                                        <Label>סטים</Label>
                                        <Input
                                            placeholder='1-10'
                                            name='setToDo'
                                            value={item.setToDo}
                                            onChange={(e) => handleChange(e, item.id)}
                                        />
                                    </div>
                                    <div>
                                        <Label>חזרות</Label>
                                        <Input
                                            name='repsToDo'
                                            placeholder='8/10/12...'
                                            value={item.repsToDo}
                                            onChange={(e) => handleChange(e, item.id)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>דגשים</Label>
                                    <Textarea
                                        placeholder='תלבש מכנסיים..'
                                        name='tipFromTrainer'
                                        value={item.tipFromTrainer}
                                        onChange={(e) => handleChange(e, item.id)}
                                    />
                                </div>
                            </div>

                            <Button
                                className='mr-5'
                                onClick={() => handleDeleteExcercise(item.id)}
                            >מחק</Button>
                        </div>
                    ))}
                    <Button
                        className='mt-2'
                        onClick={handleAddExcercise}
                    >הוסף תרגיל</Button>
                    <Button
                        className='mr-2'
                        onClick={() => handleSave(title, workoutObjs)}
                    >שמור</Button>

                </CollapsibleContent>
            </Collapsible>


        </div>
    )
}

export default ExcerciseInput
