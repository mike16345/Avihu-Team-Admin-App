import DynamicInput from "@/components/ui/DynamicInput";
import React from "react";
import SectionActions from "./SectionActions";

const SectionHeader = () => {
  return (
    <div className="bg-muted p-5 flex justify-between items-start gap-5 ">
      <div className="w-full space-y-3">
        <DynamicInput defaultValue="שם" />
        <DynamicInput defaultValue="תיאור" />
      </div>
      <SectionActions />
    </div>
  );
};

export default SectionHeader;
