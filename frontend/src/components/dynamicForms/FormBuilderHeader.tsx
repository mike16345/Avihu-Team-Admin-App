import React, { useState } from "react";
import DynamicInput from "../ui/DynamicInput";
import CustomSelect from "../ui/CustomSelect";
import { FormTypeOptions } from "@/constants/form";
import { FormTypes } from "@/interfaces/IForm";
import { Separator } from "../ui/separator";
import DatePicker from "../ui/DatePicker";
import { Skeleton } from "../ui/skeleton";

const FormBuilderHeader = () => {
  const [formType, setFormType] = useState<FormTypes>("onboarding");

  return (
    <div className=" rounded-xl shadow p-5 border space-y-3 overflow-hidden">
      <div className="flex justify-between gap-5 items-center">
        <DynamicInput defaultValue="טופס ללא שם" />

        <CustomSelect
          className="max-w-[200px] bg-muted"
          items={FormTypeOptions}
          onValueChange={(val) => setFormType(val as FormTypes)}
          selectedValue={formType}
        />
      </div>
    </div>
  );
};

export default FormBuilderHeader;
