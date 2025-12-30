import FormBuilderHeader from "@/components/dynamicForms/FormBuilderHeader";
import SectionContainer from "@/components/dynamicForms/section/SectionContainer";
import AddButton from "@/components/ui/buttons/AddButton";
import React from "react";

const FormBuilder = () => {
  return (
    <div className="p-5 space-y-5">
      <FormBuilderHeader />

      <SectionContainer />

      <AddButton onClick={() => {}} label="הוספת קטגוריה" />
    </div>
  );
};

export default FormBuilder;
