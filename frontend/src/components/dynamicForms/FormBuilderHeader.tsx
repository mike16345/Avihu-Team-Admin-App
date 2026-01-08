import CustomSelect from "../ui/CustomSelect";
import { borderColor, FormTypeOptions } from "@/constants/form";
import DatePicker from "../ui/DatePicker";
import { useFormContext } from "react-hook-form";
import { FormType } from "@/schemas/formBuilderSchema";
import { FormField, FormItem, FormMessage } from "../ui/form";
import { useEffect } from "react";
import { Input } from "../ui/input";

const FormBuilderHeader = () => {
  const {
    control,
    watch,
    formState: { errors },
    setValue,
  } = useFormContext<FormType>();
  const formType = watch("type");

  const headerError = Boolean(errors.name || errors.type || errors.showOn);

  useEffect(() => {
    if (!formType) return;

    if (formType !== "general") setValue("showOn", undefined);

    setValue("repeatMonthly", formType == "monthly");
  }, [formType]);

  return (
    <div className={`rounded-xl shadow-lg p-5 border space-y-3 ${borderColor[headerError as any]}`}>
      <div className="flex flex-col md:flex-row justify-between gap-5 items-start">
        <FormField
          name={`name`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <Input {...field} placeholder="שאלון ללא שם" />

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
              <FormItem className="w-full md:w-[200px]">
                <CustomSelect
                  className="w-full bg-muted"
                  items={FormTypeOptions}
                  onValueChange={field.onChange}
                  selectedValue={field.value}
                />
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
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
