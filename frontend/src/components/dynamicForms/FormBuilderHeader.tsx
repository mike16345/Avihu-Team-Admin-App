import React, { useState } from "react";
import DynamicInput from "../ui/DynamicInput";
import CustomSelect from "../ui/CustomSelect";
import { FormTypeOptions } from "@/constants/form";
import { FormTypes } from "@/interfaces/IForm";
import DatePicker from "../ui/DatePicker";
import { useFormContext } from "react-hook-form";
import { Form } from "@/schemas/formBuilderSchema";
import { FormField, FormItem, FormMessage } from "../ui/form";

const FormBuilderHeader = () => {
  const { control, watch } = useFormContext<Form>();

  const formType = watch("type");

  return (
    <div className=" rounded-xl shadow p-5 border space-y-3 overflow-hidden">
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
