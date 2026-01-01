import React, { useState } from "react";
import SectionHeader from "./SectionHeader";
import SectionContent from "./SectionContent";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

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
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      defaultOpen
      className="flex w-full flex-col gap-2"
    >
      <div className="rounded-xl shadow-lg border group overflow-hidden space-y-5 ">
        <SectionHeader
          parentPath={parentPath}
          handleDelete={onDeleteSection}
          handleDuplicate={onDuplicateSection}
        />
        <CollapsibleContent className="flex flex-col gap-2">
          <SectionContent parentPath={parentPath} />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SectionContainer;
