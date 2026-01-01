import DynamicInput from "../ui/DynamicInput";
import CustomSelect from "../ui/CustomSelect";
import { borderColor, FormTypeOptions } from "@/constants/form";
import DatePicker from "../ui/DatePicker";
import { useFormContext } from "react-hook-form";
import { FormType } from "@/schemas/formBuilderSchema";
import { FormField, FormItem, FormMessage } from "../ui/form";

const FormBuilderHeader = () => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<FormType>();
  const formType = watch("type");

  const headerError = Boolean(errors.name || errors.type || errors.showOn);

  return (
    <div className={`rounded-xl shadow-lg p-5 border space-y-3 ${borderColor[headerError as any]}`}>
      <div className="flex justify-between gap-5 items-center">
        <FormField
          name={`name`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <DynamicInput {...field} defaultValue="טופס ללא שם" />

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
