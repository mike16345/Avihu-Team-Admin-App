import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import DeleteModal from "@/components/Alerts/DeleteModal";

import { IForm } from "@/interfaces/IForm";
import { FormTypesInHebrew } from "@/constants/form";

export const columns: ColumnDef<IForm>[] = [
  {
    accessorKey: "name",
    id: `שם`,
    header: ({ column }) => {
      return (
        <Button
          className="m-0 px-1 py-1"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          שם
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "type",
    header: "סוג שאלון",
    cell: ({ row }) => FormTypesInHebrew[row.original.type],
  },

  {
    id: "פעולות",
    cell: ({ table, row }) => {
      const form = row.original;
      const handleDeleteForm = table.options.meta?.handleDeleteData;
      const handleViewForm = table.options.meta?.handleViewData;

      const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

      return (
        <div className="flex justify-end">
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>פעולות</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleViewForm && handleViewForm(form)}>
                צפה
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)}>מחק</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteModal
            isModalOpen={isDeleteModalOpen}
            setIsModalOpen={setIsDeleteModalOpen}
            onConfirm={() => handleDeleteForm && handleDeleteForm(form)}
            onCancel={() => setIsDeleteModalOpen(false)}
          />
        </div>
      );
    },
  },
];
