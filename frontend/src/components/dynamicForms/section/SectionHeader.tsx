import React from "react";
import SectionActions from "./SectionActions";
import { useFormContext } from "react-hook-form";
import { FormType } from "@/schemas/formBuilderSchema";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SectionHeaderProps {
  parentPath: `sections.${number}`;
  handleDelete: () => void;
  handleDuplicate: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  parentPath,
  handleDelete,
  handleDuplicate,
}) => {
  const { control } = useFormContext<FormType>();

  return (
    <div className="bg-muted p-5 flex justify-between items-start gap-5 ">
      <div className="w-full space-y-3">
        <FormField
          name={`${parentPath}.title`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem>
                <Input {...field} placeholder="קטגוריה ללא שם" />
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          name={`${parentPath}.description`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem>
                <Textarea {...field} placeholder="תיאור" />
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
      <SectionActions handleDelete={handleDelete} handleDuplicate={handleDuplicate} />
    </div>
  );
};

export default SectionHeader;
