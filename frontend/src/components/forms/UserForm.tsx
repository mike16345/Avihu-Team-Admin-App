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
import DatePicker from "../ui/DatePicker";
import DietaryTypeSelector from "../templates/dietTemplates/DietaryTypeSelector";
import { IUser } from "@/interfaces/IUser";

const datePresets=[
    {name:`חודש`, timeInDays:`30`},
    {name:`חודשיים`, timeInDays:`60`},
    {name:`שלושה חודשים`, timeInDays:`90`},
    {name:`חצי שנה`, timeInDays:`180`},
]

const userSchema = z.object({
  firstName: z.string().min(1, { message: "אנא הכנס שם פרטי" }),
  lastName: z.string().min(1, { message: "אנא הכנס שם משפחה" }),
  phone: z.string().min(7, { message: "אנא הכנס מספר טלפון תקין" }),
  email: z.string().email({ message: "כתובת מייל אינה תקינה" }),
  dateFinished: z.date({ message: 'בחר תאריך סיום' }),
  planType: z.string().min(1, { message: "בחר סוג תוכנית" }),
  dietaryType: z.string().array().optional(),
});

interface UserFormProps{
  existingUser:IUser|null;
  saveInfo:(user:IUser)=>void
}

const UserForm:React.FC<UserFormProps> = ({existingUser, saveInfo}) => {

  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      planType: "",
      dietaryType: [],
    },
  });

  const {formState:{errors}, reset}=userForm


  const onSubmit = (values: z.infer<typeof userSchema>) => {
    
    saveInfo(values)
  };

  useEffect(()=>{
    if (!existingUser) return 

    existingUser.dateFinished=new Date(existingUser.dateFinished)
    
    reset(existingUser)
  },[existingUser])

  return (
    <Form {...userForm}>
      <form onSubmit={userForm.handleSubmit(onSubmit)} className="space-y-4 p-10  w-[80%]">
        <div className="flex gap-4">
        <FormField
          control={userForm.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם פרטי</FormLabel>
              <FormControl>
                <Input placeholder="שם פרטי..." {...field} />
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
                <Input placeholder="שם משפחה..." {...field} />
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
                <Input  placeholder="מספר טלפון..." {...field} />
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
                <Input placeholder="israel@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <FormField
          control={userForm.control}
          name="planType"
          render={({ field }) => (
            <FormItem className="w-[40%]">
              <FormLabel>סוג תוכנית</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger dir="rtl">
                    <SelectValue placeholder={field.value||"בחר סוג תוכנית"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent dir="rtl">
                  <SelectItem value="מסה">מסה</SelectItem>
                  <SelectItem value="חיטוב">חיטוב</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
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
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={userForm.control}
          name="dietaryType"
          render={({ field }) => (
            <FormItem className="w-[50%]">
                <FormControl>
                 <DietaryTypeSelector 
                  existingItems={field.value} 
                  error={errors.dietaryType?true:false} 
                  saveSelected={field.onChange} 
                 />
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button  type="submit">
          שמור משתמש
        </Button>
      </form>
    </Form>
  );
};

export default UserForm;