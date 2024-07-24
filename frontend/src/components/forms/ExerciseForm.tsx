import React, { useEffect } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { exerciseSchema } from '../templates/workoutTemplates/exerciseSchema'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import useExercisePresetApi from '@/hooks/useExercisePresetApi'
import { toast } from 'sonner'

interface ExerciseFormProps {
    objectId?: string
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ objectId }) => {
    const { getExerciseById, addExercise, updateExercise } = useExercisePresetApi()

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
        console.log(values)
        if (objectId) {
            updateExercise(objectId, values)
                .then(() => toast.success(`פריט עודכן בהצלחה!`))
                .catch((err) => toast.error(`אופס, נתקלנו בבעיה!`, {
                    description: err.response.data.message
                }))
        } else {
            addExercise(values)
                .then(() => toast.success(`פריט נשמר בהצלחה!`))
                .catch((err) => toast.error(`אופס, נתקלנו בבעיה!`, {
                    description: err.response.data.message
                }))
        }
    }

    useEffect(() => {
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
                                    <SelectItem value="חזה">חזה</SelectItem>
                                    <SelectItem value="גב">גב</SelectItem>
                                    <SelectItem value="כתפיים">כתפיים</SelectItem>
                                    <SelectItem value="רגליים">רגליים</SelectItem>
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
