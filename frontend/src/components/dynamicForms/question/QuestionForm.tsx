import CustomSelect from "@/components/ui/CustomSelect";
import CustomSwitch from "@/components/ui/CustomSwitch";
import { Input } from "@/components/ui/input";
import {
  QuestionTypeOptions,
  typesRequiringOptions as defaultTypesRequiringOptions,
} from "@/constants/form";
import React, { useEffect, useMemo } from "react";
import OptionsContainer from "./OptionsContainer";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { FormType } from "@/schemas/formBuilderSchema";
import { QuestionTypes } from "@/interfaces/IForm";
import RangeContainer from "./RangeContainer";
import { Textarea } from "@/components/ui/textarea";
import { Option } from "@/types/types";

interface QuestionFormProps {
  parentPath: `sections.${number}.questions.${number}`;
  typeOptions?: Option[];
  typesRequiringOptions?: string[];
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  parentPath,
  typeOptions,
  typesRequiringOptions,
}) => {
  const { control, watch, setValue } = useFormContext<FormType>();

  const type = watch(`${parentPath}.type`);

  const effectiveTypeOptions = useMemo(() => {
    return typeOptions ?? QuestionTypeOptions;
  }, [typeOptions]);

  const effectiveTypesRequiringOptions = useMemo(() => {
    return typesRequiringOptions ?? defaultTypesRequiringOptions;
  }, [typesRequiringOptions]);

  const showOptions = useMemo(() => {
    if (!type) return false;

    return effectiveTypesRequiringOptions.includes(type);
  }, [type]);
  const showRange = useMemo(() => {
    if (!type) return false;

    return type == "range";
  }, [type, effectiveTypesRequiringOptions]);

  useEffect(() => {
    if (!showOptions && !showRange) {
      setValue(`${parentPath}.options`, []);
    }
  }, [showOptions, showRange]);

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col md:flex-row w-full gap-5 items-start">
        <FormField
          name={`${parentPath}.question`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <Input {...field} placeholder="שאלה:" />
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
              <FormItem className="w-full md:w-[250px]">
                <CustomSelect
                  className="w-full bg-muted"
                  items={effectiveTypeOptions}
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
              <Textarea className="bg-muted" placeholder="תיאור (אופציונלי)" {...field} />
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {(showOptions || showRange) && (
        <FormField
          name={`${parentPath}.options`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                {showOptions && (
                  <OptionsContainer
                    options={field.value || ["אופציה 1"]}
                    type={type as QuestionTypes}
                    onChange={field.onChange}
                  />
                )}

                {showRange && (
                  <RangeContainer options={field.value || [1]} onChange={field.onChange} />
                )}

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
