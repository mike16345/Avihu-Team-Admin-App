import React, { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import DatePicker from "../ui/DatePicker";

const datePresets=[
    {name:`חודש`, timeInDays:`30`},
    {name:`חודשיים`, timeInDays:`60`},
    {name:`שלושה חודשים`, timeInDays:`90`},
    {name:`חצי שנה`, timeInDays:`180`},
]

// Define the validation schema using Zod
const userSchema = z.object({
  firstName: z.string().min(1, { message: "אנא הכנס שם פרטי" }),
  lastName: z.string().min(1, { message: "אנא הכנס שם משפחה" }),
  phone: z.string().min(7, { message: "אנא הכנס מספר טלפון תקין" }),
  email: z.string().email({ message: "כתובת מייל אינה תקינה" }),
  dateFinished: z.date({ message: 'בחר תאריך סיום' }),
  planType: z.string().min(1, { message: "בחר סוג תוכנית" }),
  dietaryType: z.string().min(1, { message: "בחר הגבלות תזונה" }),
});

const UserForm = () => {

  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      planType: "",
      dietaryType: "",
    },
  });

  const {formState:{errors}}=userForm

  const onSubmit = (values: z.infer<typeof userSchema>) => {
    // Handle form submission here
    console.log(values);
    toast.success("User saved successfully!");
  };

  return (
    <Form {...userForm}>
      <form onSubmit={userForm.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4">
        <FormField
          control={userForm.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם פרטי</FormLabel>
              <FormControl>
                <Input placeholder="Enter first name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={userForm.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם משפחה</FormLabel>
              <FormControl>
                <Input placeholder="Enter last name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className="flex gap-4">
        <FormField
          control={userForm.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>טלפון</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={userForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>אימייל</FormLabel>
              <FormControl>
                <Input placeholder="Enter email address..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className="flex gap-4 ">
        <FormField
          control={userForm.control}
          name="dateFinished"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-between pt-2">
              <FormLabel>תאריך סיום הליווי</FormLabel>
              <FormControl>
                <DatePicker 
                    presets
                    presetValues={datePresets}
                    selectedDate={field.value}
                    onChangeDate={(date:Date)=>field.onChange(date)}
                />
                
              </FormControl>
              {errors.dateFinished && <p className="text-destructive text-sm">{errors.dateFinished.message}</p>}
            </FormItem>
          )}
        />
        <FormField
          control={userForm.control}
          name="planType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>סוג תוכנית</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="מסה">מסה</SelectItem>
                  <SelectItem value="חיטוב">חיטוב</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <FormField
          control={userForm.control}
          name="dietaryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>הגבלות תזונה</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dietary type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="omnivore">Omnivore</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Save
        </Button>
      </form>
    </Form>
  );
};

export default UserForm;