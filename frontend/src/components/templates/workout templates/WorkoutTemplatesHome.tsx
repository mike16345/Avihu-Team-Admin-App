import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkoutPresetTable from '@/components/tables/WorkoutPresetTable'
import { Button } from '@/components/ui/button';

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
                        className='my-4'
                    >הוסף תבנית</Button>
                    <WorkoutPresetTable tempData={tempPresetArr} />
                </TabsContent>
                <TabsContent value="muscleGroups">
                    <Button
                        className='my-4'
                    >הוסף קבוצת שריר</Button>
                    <WorkoutPresetTable tempData={tempMusclegroupArr} />
                </TabsContent>
                <TabsContent value="exercises">
                    <Button
                        className='my-4'
                    >הוסף תרגיל</Button>
                    <WorkoutPresetTable tempData={tempExercisesArr} />
                </TabsContent>
            </Tabs>

        </div>
    )
}

export default WorkoutTemplatesHome
