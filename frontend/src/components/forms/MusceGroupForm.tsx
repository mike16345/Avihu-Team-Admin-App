import React, { useEffect } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import useMuscleGroupsApi from '@/hooks/useMuscleGroupsApi'
import { toast } from 'sonner'

interface MusceGroupFormProps {
    objectId?: string
    closeSheet: () => void
}

const muscleGroupSchema = z.object({
    itemName: z.string().min(1, { message: `אנא הכנס שם לקבוצת שריר` })
})

const MusceGroupForm: React.FC<MusceGroupFormProps> = ({ objectId, closeSheet }) => {

    const { getMuscleGroupById, addMuscleGroup, updateMuscleGroup } = useMuscleGroupsApi()

    const muscleGroupForm = useForm<z.infer<typeof muscleGroupSchema>>({
        resolver: zodResolver(muscleGroupSchema),
        defaultValues: {
            itemName: "",
        },
    })

    const { reset } = muscleGroupForm;

    const onSubmit = (values: z.infer<typeof muscleGroupSchema>) => {
        if (objectId) {
            updateMuscleGroup(objectId, values)
                .then(() => toast.success(`פריט עודכן בהצלחה!`))
                .then(() => closeSheet())
                .catch((err) => toast.error(`אופס, נתקלנו בבעיה!`, {
                    description: err.response.data
                }))
        } else {
            addMuscleGroup(values)
                .then(() => toast.success(`פריט נשמר בהצלחה!`))
                .then(() => closeSheet())
                .catch((err) => toast.error(`אופס, נתקלנו בבעיה!`, {
                    description: err.response.data
                }))
        }
    }

    useEffect(() => {
        if (!objectId) return
        getMuscleGroupById(objectId)
            .then(res => reset(res))
            .catch(err => console.log(err))
    }, [])
    return (
        <Form {...muscleGroupForm}>
            <form onSubmit={muscleGroupForm.handleSubmit(onSubmit)} className="space-y-4 text-right" >
                <FormField
                    control={muscleGroupForm.control}
                    name="itemName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>שם</FormLabel>
                            <FormControl>
                                <Input placeholder="הכנס פריט כאן..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className='w-full' type="submit">שמור</Button>
            </form>
        </Form>
    )
}

export default MusceGroupForm
