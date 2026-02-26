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
  dragHandleProps?: any;
}

const SectionActions: React.FC<SectionActionsProps> = ({
  handleDelete,
  handleDuplicate,
  dragHandleProps,
}) => {
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
      <button
        type="button"
        className="flex justify-center cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Drag section"
        {...dragHandleProps}
      >
        <RxDragHandleDots2 />
      </button>
    </div>
  );
};

export default SectionActions;
