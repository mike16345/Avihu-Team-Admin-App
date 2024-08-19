import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { IUser } from "@/interfaces/IUser";

export const columns: ColumnDef<IUser>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="mr-4"
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="mr-4"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "firstName",
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
    accessorKey: "email",
    header: "מייל",
  },

  {
    accessorKey: "dateJoined",
    header: "תחילת הליווי",
    cell: ({ row }) => {
      const user = row.original;

      return format(user.dateJoined || user.createdAt, "PPP", { locale: he });
      //temporary fix since avihu still has createdAt not dateJoined
    },
  },
  {
    accessorKey: "dateJoined",
    header: "תום הליווי",
    cell: ({ row }) => {
      const user = row.original;

      return format(user.dateFinished, "PPP", { locale: he });
    },
  },
  {
    id: "פעולות",
    cell: ({ table, row }) => {
      const user = row.original;
      const handleDeleteUser = table.options.meta?.handleDeleteData;
      const handleViewUser = table.options.meta?.handleViewData;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => handleViewUser && handleViewUser(user)}>
              View user
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteUser && handleDeleteUser(user)}>
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
