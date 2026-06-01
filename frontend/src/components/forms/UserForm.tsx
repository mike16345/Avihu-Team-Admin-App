import React from "react";
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
import DatePicker from "../ui/DatePicker";
import DietaryTypeSelector from "../templates/dietTemplates/DietaryTypeSelector";
import { IUser, IUserPost } from "@/interfaces/IUser";
import CustomButton from "../ui/CustomButton";
import userSchema from "@/schemas/userSchema";
import UserPlanTypes from "@/enums/UserPlanTypes";
import SubTrainerDropdown from "../ui/SubTrainerDropdown";

const remindInOptions = [
  { value: "604800", name: "שבוע" },
  { value: "1209600", name: "שבועיים" },
  { value: "1814400", name: "שלושה שבועות" },
  { value: "2592000", name: "חודש" },
];

const datePresets = [
  { name: "חודש", timeInDays: "30" },
  { name: "חודשיים", timeInDays: "60" },
  { name: "שלושה חודשים", timeInDays: "90" },
  { name: "ארבעה חודשים", timeInDays: "120" },
  { name: "חמישה חודשים", timeInDays: "150" },
  { name: "שישה חודשים", timeInDays: "180" },
  { name: "שבעה חודשים", timeInDays: "210" },
  { name: "שמונה חודשים", timeInDays: "240" },
  { name: "תשעה חודשים", timeInDays: "270" },
  { name: "עשרה חודשים", timeInDays: "300" },
  { name: "אחד עשר חודשים", timeInDays: "330" },
  { name: "שנה", timeInDays: "360" },
];

interface UserFormProps {
  existingUser?: IUser;
  saveInfo: (user: IUserPost) => void;
  pending?: boolean;
}

function getRemindInDate(remindIn: number) {
  const result = remindInOptions.find((o) => o.value == String(remindIn));
  return result?.name || "לא נבחר";
}

const UserForm: React.FC<UserFormProps> = ({ existingUser, saveInfo, pending }) => {
  const userFinishDate = existingUser ? new Date(existingUser.dateFinished) : undefined;
  const userForm = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: existingUser?.firstName || "",
      lastName: existingUser?.lastName || "",
      phone: existingUser?.phone || "",
      email: existingUser?.email || "",
      planType: existingUser?.planType || "",
      dietaryType: existingUser?.dietaryType || [],
      remindIn: existingUser?.remindIn,
      dateFinished: userFinishDate,
      subTrainerId: existingUser?.subTrainerId || undefined,
    },
  });

  const {
    formState: { errors },
  } = userForm;

  const onSubmit = (values: z.infer<typeof userSchema>) => {
    const user: IUserPost = { ...values, email: values.email.toLowerCase() };

    saveInfo(user);
  };

  return (
    <Form {...userForm}>
      <form
        data-testid="user-form"
        onSubmit={userForm.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <div className="flex items-center gap-4 sm:w-1/2">
          <FormField
            control={userForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>שם פרטי</FormLabel>
                <FormControl>
                  <Input data-testid="user-form-first-name" placeholder="שם פרטי..." {...field} />
                </FormControl>
                <FormMessage data-testid="user-form-first-name-error" />
              </FormItem>
            )}
          />
          <FormField
            control={userForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>שם משפחה</FormLabel>
                <FormControl>
                  <Input data-testid="user-form-last-name" placeholder="שם משפחה..." {...field} />
                </FormControl>
                <FormMessage data-testid="user-form-last-name-error" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center gap-4 sm:w-1/2">
          <FormField
            control={userForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>טלפון</FormLabel>
                <FormControl>
                  <Input
                    data-testid="user-form-phone"
                    dir="ltr"
                    className="text-center"
                    placeholder="טלפון"
                    {...field}
                  />
                </FormControl>
                <FormMessage data-testid="user-form-phone-error" />
              </FormItem>
            )}
          />
          <FormField
            control={userForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>אימייל</FormLabel>
                <FormControl>
                  <Input
                    data-testid="user-form-email"
                    className="text-center"
                    placeholder="israel@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage data-testid="user-form-email-error" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={userForm.control}
          name="planType"
          render={({ field }) => (
            <FormItem className="sm:w-1/2">
              <FormLabel>סוג תוכנית</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="user-form-plan-type" dir="rtl">
                    <SelectValue placeholder={field.value || "בחר סוג תוכנית"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent dir="rtl">
                  <SelectItem value={UserPlanTypes.BULK}>{UserPlanTypes.BULK}</SelectItem>
                  <SelectItem value={UserPlanTypes.CUT}>{UserPlanTypes.CUT}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage data-testid="user-form-plan-type-error" />
            </FormItem>
          )}
        />
        <FormField
          control={userForm.control}
          name="subTrainerId"
          render={({ field }) => (
            <FormItem className="sm:w-1/2">
              <FormLabel>מאמן</FormLabel>
              <SubTrainerDropdown onSelect={field.onChange} value={field.value} />
              <FormMessage data-testid="user-form-sub-trainer-error" />
            </FormItem>
          )}
        />
        <FormField
          control={userForm.control}
          name="remindIn"
          render={({ field }) => {
            const remindIn = getRemindInDate(field.value);

            return (
              <FormItem className="sm:w-1/2">
                <FormLabel>בדיקה תקופתית</FormLabel>
                <Select key={remindIn} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger data-testid="user-form-remind-in" dir="rtl">
                      <SelectValue placeholder={remindIn || "תבדוק אותי כל שבוע..."} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent dir="rtl">
                    {remindInOptions.map((option) => (
                      <SelectItem key={option.name} value={option.value}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage data-testid="user-form-remind-in-error" />
              </FormItem>
            );
          }}
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
                  noPrevDates
                  presetValues={datePresets}
                  selectedDate={field.value}
                  onChangeDate={(date: Date) => field.onChange(date)}
                  triggerTestId="user-form-date-finished"
                  presetTriggerTestId="user-form-date-preset"
                />
              </FormControl>
              <FormMessage data-testid="user-form-date-finished-error" />
            </FormItem>
          )}
        />
        <FormField
          control={userForm.control}
          name="dietaryType"
          render={({ field }) => (
            <FormItem className="sm:w-2/4">
              <FormControl>
                <DietaryTypeSelector
                  existingItems={field.value}
                  error={errors.dietaryType ? true : false}
                  saveSelected={field.onChange}
                />
              </FormControl>
              <FormMessage data-testid="user-form-dietary-type-error" />
            </FormItem>
          )}
        />
        <CustomButton
          data-testid="user-form-submit"
          title="שמור משתמש"
          type="submit"
          className="sm:w-32 w-full"
          variant={"success"}
          isLoading={pending}
        />
      </form>
    </Form>
  );
};

export default UserForm;
