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
import { useUsersApi } from "@/hooks/api/useUsersApi";
import { useState } from "react";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import { Switch } from "@/components/ui/switch";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";

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
          שם פרטי
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "lastName",
    header: "שם משפחה",
  },
  {
    accessorKey: "email",
    header: "מייל",
  },
  {
    accessorKey: "phone",
    header: "פלאפון",
  },
  {
    accessorKey: "hasAccess",
    header: "רשות",
    cell: ({ row }) => {
      const { updateUserField } = useUsersApi();
      const [isChecked, setIsChecked] = useState(row.original.hasAccess);

      const handleChangeAccess = async (hasAccess: boolean) => {
        setIsChecked(hasAccess);
        await updateUserField(row.original._id!, "hasAccess", hasAccess)
          .then((res) => {
            setIsChecked(res.data.hasAccess);
          })
          .catch((err) => {
            console.log("error", err);
            toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE);
            setIsChecked(!hasAccess);
          });
      };

      return (
        <Switch
          dir="rtl"
          checked={isChecked}
          onCheckedChange={(value) => handleChangeAccess(Boolean(value))}
        />
      );
    },
  },

  {
    accessorKey: "dateJoined",
    header: "תחילת הליווי",
    cell: ({ row }) => {
      const user = row.original;

      return format(user.dateJoined, "PPP", { locale: he });
      //temporary fix since avihu still has createdAt not dateJoined
    },
  },
  {
    accessorKey: "dateFinished",
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
