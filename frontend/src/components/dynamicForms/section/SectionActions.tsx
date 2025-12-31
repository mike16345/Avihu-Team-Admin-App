import CopyButton from "@/components/ui/buttons/CopyButton";
import DeleteButton from "@/components/ui/buttons/DeleteButton";
import React from "react";
import { RxDragHandleDots2 } from "react-icons/rx";

interface SectionActionsProps {
  handleDelete: () => void;
  handleDuplicate: () => void;
}

const SectionActions: React.FC<SectionActionsProps> = ({ handleDelete, handleDuplicate }) => {
  return (
    <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-all">
      <CopyButton onClick={handleDuplicate} tip="שכפול" />
      <DeleteButton onClick={handleDelete} tip="הסרה" />
      <RxDragHandleDots2 />
    </div>
  );
};

export default SectionActions;
