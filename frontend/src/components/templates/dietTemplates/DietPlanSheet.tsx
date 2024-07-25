import React, { useEffect, useState } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import useMenuItemApi from '@/hooks/useMenuItemApi'
import { toast } from 'sonner'
import { IMenuItem } from '@/interfaces/IDietPlan'


const DietPlanSheet = () => {

    const navigate = useNavigate()
    const { type, id } = useParams()
    const { addMenuItem, getOneMenuItem, editMenuItem } = useMenuItemApi()
    const [existingMenuItem, setExistingMenuItem] = useState<IMenuItem>()

    const [isEdit] = useState<boolean>(Boolean(id));

    const menuItemForm = useForm<z.infer<typeof menuItemSchema>>({
        resolver: zodResolver(menuItemSchema),
        defaultValues: {
            itemName: "",
            dietaryType: "Standard",
            oneServing:
            {
                spoons: 0,
                grams: 0
            }
        },
        values: existingMenuItem
    })

    const { reset } = menuItemForm;

    const onSubmit = (values: z.infer<typeof menuItemSchema>) => {
        if (!type) return

        const newMenuItem = {
            ...values,
            foodGroup: type
        }
        if (isEdit) {
            if (!id) return
            editMenuItem(newMenuItem, id)
                .then(() => toast.success(`פריט עודכן בהצלחה!`))
                .catch(err => toast.error(`אופס, נתקלנו בבעיה!`, {
                    description: err.response.data.message
                }))
        } else {
            addMenuItem(newMenuItem)
                .then(() => toast.success(`פריט נשמר בהצלחה!`))
                .catch(err => toast.error(`אופס, נתקלנו בבעיה!`, {
                    description: err.response.data.message
                }))
        }

        navigate(`/dietPlans`)
    }

    useEffect(() => {
        if (isEdit) {
            if (!id) return
            if (!type) return
            getOneMenuItem(type, id)
                .then(res => reset(res))
                .catch(err => console.log(err))
        }
    }, [])

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
                                <FormField
                                    control={menuItemForm.control}
                                    name="oneServing.spoons"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>כפות במנה</FormLabel>
                                            <FormControl>
                                                <Input type='number' placeholder="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={menuItemForm.control}
                                name="dietaryType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>הגבלות תזונה</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger dir='rtl'>
                                                    <SelectValue placeholder='sss' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent dir='rtl'>
                                                <SelectItem value="Standard">ללא</SelectItem>
                                                <SelectItem value="vegan">טבעוני</SelectItem>
                                                <SelectItem value="vegetarian">צמחוני</SelectItem>
                                                <SelectItem value="pescetarian">פסקטריאן</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button className='w-full' type="submit">שמור</Button>
                        </form>
                    </Form>
                </SheetHeader>
            </SheetContent>
        </Sheet >

    )
}

export default DietPlanSheet
