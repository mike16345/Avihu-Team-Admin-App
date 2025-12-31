import React from "react";
import SectionHeader from "./SectionHeader";
import SectionContent from "./SectionContent";

interface SectionContainerProps {
  parentPath: `sections.${number}`;
  onDeleteSection: () => void;
  onDuplicateSection: () => void;
}

const SectionContainer: React.FC<SectionContainerProps> = ({
  onDuplicateSection,
  onDeleteSection,
  parentPath,
}) => {
  return (
    <div className="rounded-xl shadow-lg border group overflow-hidden space-y-5 ">
      <SectionHeader
        parentPath={parentPath}
        handleDelete={onDeleteSection}
        handleDuplicate={onDuplicateSection}
      />
      <SectionContent parentPath={parentPath} />
    </div>
  );
};

export default SectionContainer;
