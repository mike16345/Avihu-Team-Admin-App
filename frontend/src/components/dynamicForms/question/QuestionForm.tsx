import CustomSelect from "@/components/ui/CustomSelect";
import CustomSwitch from "@/components/ui/CustomSwitch";
import DynamicInput from "@/components/ui/DynamicInput";
import { Input } from "@/components/ui/input";
import { QuestionTypeOptions, typesRequiringOptions } from "@/constants/form";
import React, { useEffect, useMemo } from "react";
import OptionsContainer from "./OptionsContainer";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FormType } from "@/schemas/formBuilderSchema";

interface QuestionFormProps {
  parentPath: `sections.${number}.questions.${number}`;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ parentPath }) => {
  const { control, watch, setValue } = useFormContext<FormType>();

  const type = watch(`${parentPath}.type`);

  const showOptions = useMemo(() => {
    if (!type) return false;

    return typesRequiringOptions.includes(type);
  }, [type]);

  useEffect(() => {
    if (!showOptions) {
      setValue(`${parentPath}.options`, []);
    }
  }, [showOptions]);

  return (
    <div className="w-full space-y-5">
      <div className="flex w-full gap-5 items-center">
        <FormField
          name={`${parentPath}.question`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <DynamicInput {...field} defaultValue="שאלה ללא שם" />
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          name={`${parentPath}.type`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className=" w-[250px]">
                <CustomSelect
                  className="w-full bg-muted"
                  items={QuestionTypeOptions}
                  onValueChange={field.onChange}
                  selectedValue={field.value}
                />
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
      <FormField
        name={`${parentPath}.description`}
        control={control}
        render={({ field }) => {
          return (
            <FormItem className="w-full">
              <Input className="bg-muted" placeholder="תיאור (אופציונלי)" {...field} />
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {showOptions && (
        <FormField
          name={`${parentPath}.options`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <OptionsContainer options={field.value || ["אופציה 1"]} onChange={field.onChange} />

                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}

      <FormField
        name={`${parentPath}.required`}
        control={control}
        render={({ field }) => {
          return (
            <FormItem className="w-full">
              <CustomSwitch
                className="font-bold"
                checked={field.value}
                label="חובה"
                onCheckedChange={field.onChange}
                id="required"
              />
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
};

export default QuestionForm;
