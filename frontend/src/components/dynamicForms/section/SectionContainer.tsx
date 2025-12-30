import React from "react";
import SectionHeader from "./SectionHeader";
import SectionContent from "./SectionContent";

const SectionContainer = () => {
  return (
    <div className="rounded-xl shadow-lg border group overflow-hidden space-y-5 ">
      <SectionHeader />
      <SectionContent />
    </div>
  );
};

export default SectionContainer;
