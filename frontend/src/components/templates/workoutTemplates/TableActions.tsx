import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsThreeDots } from "react-icons/bs";

interface TableActionsProps {
  handleDelete: () => void;
  handleEdit: () => void;
}

const TableActions: React.FC<TableActionsProps> = ({ handleDelete, handleEdit }) => {
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger
        className="hover:bg-accent p-2 rounded-lg"
        data-testid="row-actions-trigger"
      >
        <BsThreeDots />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="font-bold">פעולות</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem data-testid="row-action-edit" onClick={handleEdit}>
          עריכה
        </DropdownMenuItem>
        <DropdownMenuItem data-testid="row-action-delete" onClick={handleDelete}>
          מחיקה
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableActions;
