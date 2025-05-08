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
import { Switch } from "@/components/ui/switch";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import DeleteModal from "@/components/Alerts/DeleteModal";
import { invalidateQueryKeys } from "@/QueryClient/queryClient";
import { QueryKeys } from "@/enums/QueryKeys";

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
        id="row-checkbox"
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
    cell(row) {
      return <span dir="ltr">{String(row.renderValue())}</span>;
    },
  },
  {
    accessorKey: "hasAccess",
    header: "רשות",
    cell: ({ row }) => {
      const { updateUserField } = useUsersApi();
      const [isChecked, setIsChecked] = useState(row.original.hasAccess);
      const [isToggling, setIsToggling] = useState(false);

      const handleChangeAccess = async (hasAccess: boolean) => {
        setIsChecked(hasAccess);
        setIsToggling(true);
        await updateUserField(row.original._id!, "hasAccess", hasAccess)
          .then((res) => {
            setIsChecked(res.data.hasAccess);

            toast.success(
              `הגישה לאפליקציה ${res.data.hasAccess ? "ניתנה" : "נחסמה "}  ל- ${
                row.original.firstName
              } ${row.original.lastName}`
            );

            setIsToggling(false);

            invalidateQueryKeys([QueryKeys.USERS, QueryKeys.USERS + res.data._id]);
          })
          .catch((err) => {
            setIsToggling(false);
            toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE);
            setIsChecked(!hasAccess);
          });
      };

      return (
        <Switch
          dir="rtl"
          disabled={isToggling}
          id="access-switch"
          checked={isChecked}
          onCheckedChange={(value: any) => handleChangeAccess(Boolean(value))}
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

      const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

      return (
        <>
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

              <DropdownMenuItem onClick={() => handleViewUser && handleViewUser(user)}>
                צפה
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)}>מחק</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteModal
            isModalOpen={isDeleteModalOpen}
            setIsModalOpen={setIsDeleteModalOpen}
            onConfirm={() => handleDeleteUser && handleDeleteUser(user)}
            onCancel={() => setIsDeleteModalOpen(false)}
          />
        </>
      );
    },
  },
];
