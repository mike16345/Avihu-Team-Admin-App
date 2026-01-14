import DynamicInput from "../ui/DynamicInput";
import CustomSelect from "../ui/CustomSelect";
import { borderColor, FormTypeOptions } from "@/constants/form";
import DatePicker from "../ui/DatePicker";
import { useFormContext } from "react-hook-form";
import { FormType } from "@/schemas/formBuilderSchema";
import { FormField, FormItem, FormMessage } from "../ui/form";
import { useEffect } from "react";
import { Option } from "@/types/types";

interface FormBuilderHeaderProps {
  formTypeOptions?: Option[];
  disableOnboarding?: boolean;
}

const FormBuilderHeader = ({
  formTypeOptions = FormTypeOptions,
  disableOnboarding = false,
}: FormBuilderHeaderProps) => {
  const {
    control,
    watch,
    formState: { errors },
    setValue,
  } = useFormContext<FormType>();
  const formType = watch("type");

  const availableTypeOptions = disableOnboarding
    ? formTypeOptions.filter((option) => option.value !== "onboarding")
    : formTypeOptions;
  const headerError = Boolean(errors.name || errors.type || errors.showOn);

  useEffect(() => {
    if (!formType) return;

    if (disableOnboarding && formType === "onboarding") {
      setValue("type", "general");
    }

    if (formType !== "general") setValue("showOn", undefined);

    setValue("repeatMonthly", formType == "monthly");
  }, [formType, disableOnboarding, setValue]);

  return (
    <div className={`rounded-xl shadow-lg p-5 border space-y-3 ${borderColor[headerError as any]}`}>
      <div className="flex justify-between gap-5 items-center">
        <FormField
          name={`name`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <DynamicInput {...field} defaultValue="שאלון ללא שם" />

                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          name={`type`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className="w-[200px]">
                <CustomSelect
                  className="w-full bg-muted"
                  items={availableTypeOptions}
                  onValueChange={field.onChange}
                  selectedValue={field.value}
                />
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
      {disableOnboarding && (
        <p className="text-sm text-muted-foreground">
          שאלון התחלה כבר קיים. ניתן לערוך אותו מרשימת השאלונים.
        </p>
      )}
      {formType == "general" && (
        <FormField
          name={`showOn`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <DatePicker onChangeDate={field.onChange} selectedDate={field.value} />

                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}
    </div>
  );
};

export default FormBuilderHeader;
