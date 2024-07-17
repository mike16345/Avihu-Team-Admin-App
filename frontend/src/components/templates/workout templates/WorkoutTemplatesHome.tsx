import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkoutPresetTable from '@/components/tables/WorkoutPresetTable'
import { Button } from '@/components/ui/button';
import AddSheet from './AddSheet';
import { useNavigate } from 'react-router-dom';

const tempPresetArr = [
    'ABC-מתחיל', 'ABC-בינוני', 'ABC-מתקדם',
    'AB-מתחיל', 'AB-בינוני', 'AB-מתקדם',
    'פול בודי-מתחיל', 'פול בודי-בינוני', 'פול בודי-מתקדם',
    'ABC-מתחיל', 'ABC-בינוני', 'ABC-מתקדם',
    'AB-מתחיל', 'AB-בינוני', 'AB-מתקדם',
    'פול בודי-מתחיל', 'פול בודי-בינוני', 'פול בודי-מתקדם',
    'ABC-מתחיל', 'ABC-בינוני', 'ABC-מתקדם',
    'AB-מתחיל', 'AB-בינוני', 'AB-מתקדם',
    'פול בודי-מתחיל', 'פול בודי-בינוני', 'פול בודי-מתקדם',
    'ABC-מתחיל', 'ABC-בינוני', 'ABC-מתקדם',
    'AB-מתחיל', 'AB-בינוני', 'AB-מתקדם',
    'פול בודי-מתחיל', 'פול בודי-בינוני', 'פול בודי-מתקדם',
];

const tempMusclegroupArr = [
    'חזה',
    'גב',
    'כתפיים',
    'רגליים',
    'בטן',
    'זרועות',
    'ירכיים',
    'שוקיים',
    'תלת ראשי',
    'דו ראשי'
];

const tempExercisesArr = [
    'לחיצת חזה',
    'משיכת גב',
    'לחיצת כתפיים',
    'סקוואט',
    'כפיפות בטן',
    'כפיפת זרועות',
    'דדליפט',
    'כפיפת ברכיים',
    'מתח',
    'מקבילים'
];

const WorkoutTemplatesHome = () => {
    const [tempPresetState, setTempPresetState] = useState<string[]>(tempPresetArr)
    const [tempMusclegroupState, setTempMusclegroupState] = useState<string[]>(tempMusclegroupArr)
    const [tempExerciseState, setTempExerciseState] = useState<string[]>(tempExercisesArr)

    const navigate = useNavigate()

    const addItem = (
        item: string,
        arr: string[],
        arrSetter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        const newArr = [...arr];
        newArr.push(item);
        arrSetter(newArr)
    }

    const deleteItem = (
        index: number,
        arr: string[],
        arrSetter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {

        const filteredArr = arr.filter((_, i) => i !== index);
        arrSetter(filteredArr)

    }
    const editItem = (
        index: number,
        item: string,
        arr: string[],
        arrSetter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {

        const newArr = arr.map((arrItem, i) => i === index ? item : arrItem);
        arrSetter(newArr)

    }

    return (
        <div>
            <Tabs defaultValue="WorkoutPlans" className="w-[600px]" dir='rtl'>
                <TabsList>
                    <TabsTrigger value="WorkoutPlans">תבניות אימונים</TabsTrigger>
                    <TabsTrigger value="muscleGroups">קבוצות שריר</TabsTrigger>
                    <TabsTrigger value="exercises">תרגילים</TabsTrigger>
                </TabsList>
                <TabsContent value="WorkoutPlans">
                    <Button
                        onClick={() => navigate(`/workoutPlans/presets/workout-template`)}
                        className='my-4'
                    >הוסף תבנית</Button>
                    <WorkoutPresetTable
                        tempData={tempPresetState}
                        handleDelete={(i) => deleteItem(i, tempPresetState, setTempPresetState)}
                    />
                </TabsContent>
                <TabsContent value="muscleGroups">
                    <Button
                        onClick={() => navigate(`/workoutPlans/presets/muscleGroups`)}
                        className='my-4'
                    >הוסף קבוצת שריר</Button>
                    <WorkoutPresetTable
                        tempData={tempMusclegroupState}
                        handleDelete={(i) => deleteItem(i, tempMusclegroupState, setTempMusclegroupState)}
                    />
                </TabsContent>
                <TabsContent value="exercises">
                    <Button
                        onClick={() => navigate(`/workoutPlans/presets/exercises`)}
                        className='my-4'
                    >הוסף תרגיל</Button>
                    <WorkoutPresetTable
                        tempData={tempExerciseState}
                        handleDelete={(i) => deleteItem(i, tempExerciseState, setTempExerciseState)}
                    />
                </TabsContent>
            </Tabs>

        </div>
    )
}

export default WorkoutTemplatesHome
