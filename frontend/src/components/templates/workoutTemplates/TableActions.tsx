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
  testIdPrefix?: string;
}

const TableActions: React.FC<TableActionsProps> = ({
  handleDelete,
  handleEdit,
  testIdPrefix,
}) => {
  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger
        data-testid={testIdPrefix ? `${testIdPrefix}-actions-trigger` : undefined}
        className="hover:bg-accent p-2 rounded-lg"
      >
        <BsThreeDots />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="font-bold">פעולות</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid={testIdPrefix ? `${testIdPrefix}-edit` : undefined}
          onClick={handleEdit}
        >
          עריכה
        </DropdownMenuItem>
        <DropdownMenuItem
          data-testid={testIdPrefix ? `${testIdPrefix}-delete` : undefined}
          onClick={handleDelete}
        >
          מחיקה
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableActions;
