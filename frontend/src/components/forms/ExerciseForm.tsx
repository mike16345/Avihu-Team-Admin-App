import React, { useEffect, useState } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import useExercisePresetApi from '@/hooks/useExercisePresetApi'
import { toast } from 'sonner'
import useMuscleGroupsApi from '@/hooks/useMuscleGroupsApi'
import { IMuscleGroupItem } from '@/interfaces/IWorkoutPlan'

interface ExerciseFormProps {
    objectId?: string
    closeSheet: () => void
}

const exerciseSchema = z.object({
    itemName: z.string().min(1, { message: `שם התרגיל חייב להיות תו אחד או יותר` }),
    muscleGroup: z.string().min(1, { message: `תרגיל חייב להיות משוייך לקבוצת שריר` }),
    tipsFromTrainer: z.string().min(1).optional(),
    linkToVideo: z.string().url({ message: `אנא הכנס לינק תקין!` })
})

const ExerciseForm: React.FC<ExerciseFormProps> = ({ objectId, closeSheet }) => {
    const { getExerciseById, addExercise, updateExercise } = useExercisePresetApi()
    const { getAllMuscleGroups } = useMuscleGroupsApi()
    const [muscleGroups, setMuscleGroups] = useState<IMuscleGroupItem[]>()

    const exerciseForm = useForm<z.infer<typeof exerciseSchema>>({
        resolver: zodResolver(exerciseSchema),
        defaultValues: {
            itemName: "",
            muscleGroup: "",
            linkToVideo: "",
            tipsFromTrainer: ""
        },
    })

    const { reset } = exerciseForm

    const onSubmit = (values: z.infer<typeof exerciseSchema>) => {
        if (objectId) {
            updateExercise(objectId, values)
                .then(() => toast.success(`פריט עודכן בהצלחה!`))
                .then(() => closeSheet())
                .catch((err) => toast.error(`אופס, נתקלנו בבעיה!`, {
                    description: err.response.data.message
                }))
        } else {
            addExercise(values)
                .then(() => toast.success(`פריט נשמר בהצלחה!`))
                .then(() => closeSheet())
                .catch((err) => toast.error(`אופס, נתקלנו בבעיה!`, {
                    description: err.response.data.message
                }))
        }
    }

    useEffect(() => {
        getAllMuscleGroups()
            .then(res => setMuscleGroups(res))
            .catch(err => console.log(err))

        if (!objectId) return

        getExerciseById(objectId)
            .then(res => reset(res))
            .catch(err => console.log(err))
    }, [])

    return (
        <Form {...exerciseForm}>
            <form onSubmit={exerciseForm.handleSubmit(onSubmit)} className="space-y-4 text-right" >
                <FormField
                    control={exerciseForm.control}
                    name="itemName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>שם התרגיל</FormLabel>
                            <FormControl>
                                <Input placeholder="הכנס פריט כאן..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={exerciseForm.control}
                    name="linkToVideo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>לינק לסרטון</FormLabel>
                            <FormControl>
                                <Input placeholder="https://youtube.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={exerciseForm.control}
                    name="tipsFromTrainer"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>דגשים</FormLabel>
                            <FormControl>
                                <Input placeholder="דגשים לתרגיל..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={exerciseForm.control}
                    name="muscleGroup"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>קבוצת שריר</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger dir='rtl'>
                                        <SelectValue placeholder={field.value} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent dir='rtl'>
                                    {muscleGroups?.map(muscleGroup =>
                                        <SelectItem
                                            key={muscleGroup.itemName}
                                            value={muscleGroup.itemName}
                                        >{muscleGroup.itemName}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className='w-full' type="submit">שמור</Button>
            </form>
        </Form>
    )
}

export default ExerciseForm
