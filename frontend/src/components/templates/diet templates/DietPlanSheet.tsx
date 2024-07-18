import React, { useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Input } from '@/components/ui/input'
import { menuItemSchema } from './DietPlanItemSchema'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'


const DietPlanSheet = () => {

    const navigate = useNavigate()
    const { type, id } = useParams()

    const [isEdit] = useState<boolean>(Boolean(id));

    const menuItemForm = useForm<z.infer<typeof menuItemSchema>>({
        resolver: zodResolver(menuItemSchema),
        defaultValues: {
            itemName: "",
            oneServing: {
                spoons: 0,
                grams: 0
            }
        },
    })

    const onSubmit = (values: z.infer<typeof menuItemSchema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
        navigate(`/dietPlans`)
    }

    return (
        <Sheet defaultOpen onOpenChange={() => navigate(`/dietPlans`)}>
            <SheetContent dir='rtl'>
                <SheetHeader>
                    <SheetTitle className='text-right text-3xl py-4'>הוסף פריט</SheetTitle>
                    <SheetDescription className='text-center'>
                        כאן תוכל להוסיף פריטים לרשימה הקיימת במערכת.
                    </SheetDescription>
                    <Form {...menuItemForm}>
                        <form onSubmit={menuItemForm.handleSubmit(onSubmit)} className="space-y-4 text-right" >
                            <FormField
                                control={menuItemForm.control}
                                name="itemName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>שם פריט</FormLabel>
                                        <FormControl>
                                            <Input placeholder="הכנס פריט כאן..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='flex gap-5'>
                                <FormField
                                    control={menuItemForm.control}
                                    name="oneServing.spoons"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>כפות במנה</FormLabel>
                                            <FormControl>
                                                <Input type='number' placeholder="1-2-3-4" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={menuItemForm.control}
                                    name="oneServing.grams"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>גרם במנה</FormLabel>
                                            <FormControl>
                                                <Input type='number' placeholder="80g" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button className='w-full' type="submit">שמור</Button>
                        </form>
                    </Form>
                </SheetHeader>
            </SheetContent>
        </Sheet>

    )
}

export default DietPlanSheet
