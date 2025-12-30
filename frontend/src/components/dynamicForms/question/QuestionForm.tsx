import CustomSelect from "@/components/ui/CustomSelect";
import CustomSwitch from "@/components/ui/CustomSwitch";
import DynamicInput from "@/components/ui/DynamicInput";
import { Input } from "@/components/ui/input";
import { QuestionTypeOptions } from "@/constants/form";
import React from "react";
import OptionsContainer from "./OptionsContainer";

const QuestionForm = () => {
  return (
    <div className="w-full space-y-5">
      <div className="flex w-full gap-5 items-center">
        <DynamicInput />
        <CustomSelect
          className=" max-w-[200px] bg-muted"
          items={QuestionTypeOptions}
          onValueChange={() => {}}
        />
      </div>
      <Input className="bg-muted" placeholder="שאלה" />
      <Input className="bg-muted" placeholder="תיאור (אופציונלי)" />

      <OptionsContainer type="checkboxes" options={[]} />

      <CustomSwitch
        className="font-bold"
        checked={false}
        label="חובה"
        onCheckedChange={(val) => {}}
        id="required"
      />
    </div>
  );
};

export default QuestionForm;
