import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/buttons/CopyButton";
import DeleteButton from "@/components/ui/buttons/DeleteButton";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { LuChevronsUpDown } from "react-icons/lu";
import React from "react";
import { RxDragHandleDots2 } from "react-icons/rx";

interface SectionActionsProps {
  handleDelete: () => void;
  handleDuplicate: () => void;
}

const SectionActions: React.FC<SectionActionsProps> = ({ handleDelete, handleDuplicate }) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 items-center">
      <CopyButton onClick={handleDuplicate} tip="שכפול" />
      <DeleteButton onClick={handleDelete} tip="הסרה" />
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <LuChevronsUpDown />
          <span className="sr-only">Toggle</span>
        </Button>
      </CollapsibleTrigger>
      <RxDragHandleDots2 />
    </div>
  );
};

export default SectionActions;
