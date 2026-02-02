import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormTypesInHebrew } from "@/constants/form";
import DateUtils from "@/lib/dateUtils";
import { FormResponse } from "@/interfaces/IFormResponse";
import { FormTypes } from "@/interfaces/IForm";
import { resolveUserName } from "@/components/agreements/SignedAgreementsTable";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useFormResponsesApi from "@/hooks/api/useFormResponsesApi";
import { toast } from "sonner";
import DeleteModal from "@/components/Alerts/DeleteModal";
import queryClient from "@/QueryClient/queryClient";
import { formResponsesKeys } from "@/hooks/queries/formResponses/formResponsesKeys";

const formatSubmittedAt = (submittedAt?: string) => {
  if (!submittedAt) return "-";
  const parsedDate = new Date(submittedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return submittedAt;
  }
  return DateUtils.formatDate(parsedDate, "DD/MM/YYYY");
};

export const useFormResponseColumns = () =>
  useMemo<ColumnDef<FormResponse>[]>(
    () => [
      {
        id: "שם",
        accessorKey: "userId",
        cell: ({ row }) => {
          return resolveUserName(row.original.userId) || "לא ידוע ";
        },
        header: ({ column }) => (
          <Button
            className="m-0 px-1 py-1"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            משתמש
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        ),
      },
      {
        id: "שאלון",
        accessorFn: (row) => row.formTitle ?? row.formId?.name ?? "",

        cell: ({ row }) => {
          const name = row.original.formTitle ?? row.original.formId?.name;
          return name || "לא ידוע";
        },
      },
      {
        accessorKey: "formType",
        header: "סוג השאלון",
        cell: ({ row }) => {
          const rawType = row.original.formType ?? row.original.formId?.type;
          if (!rawType) return "-";
          return FormTypesInHebrew[rawType as FormTypes] ?? rawType;
        },
      },

      {
        accessorKey: "submittedAt",
        header: "נענתה בתאריך",
        cell: ({ row }) => formatSubmittedAt(row.original.submittedAt),
      },

      {
        id: "viewed",
        header: "נצפה",
        cell: ({ row }) => {
          const { toggleIsCheckedResponse } = useFormResponsesApi();
          const [isViewed, setIsViewed] = useState(Boolean(row.original.isChecked));
          const [isUpdating, setIsUpdating] = useState(false);

          const handleViewedChange = async (checked: boolean) => {
            if (!row.original._id) return;
            const previousValue = isViewed;
            setIsViewed(checked);
            setIsUpdating(true);

            try {
              const res = await toggleIsCheckedResponse(row.original._id, checked);

              setIsViewed(res.data?.isChecked ?? checked);
              queryClient.invalidateQueries({ queryKey: formResponsesKeys.all });
            } catch (error) {
              console.error("Error updating viewed status:", error);
              setIsViewed(previousValue);
              toast.error("לא הצלחנו לעדכן את סטטוס הצפייה");
            } finally {
              setIsUpdating(false);
            }
          };

          return (
            <Checkbox
              id="viewed-checkbox"
              checked={isViewed}
              disabled={isUpdating}
              onClick={(event) => event.stopPropagation()}
              onCheckedChange={(value) => handleViewedChange(Boolean(value))}
              aria-label="סימון כנצפה"
            />
          );
        },
      },
      {
        id: "actions",
        cell: ({ table, row }) => {
          const response = row.original;
          const handleDeleteResponse = table.options.meta?.handleDeleteData;
          const handleViewResponse = table.options.meta?.handleViewData;
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
                  <DropdownMenuItem
                    onClick={() => handleViewResponse && handleViewResponse(response)}
                  >
                    צפה
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    מחק
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DeleteModal
                isModalOpen={isDeleteModalOpen}
                setIsModalOpen={setIsDeleteModalOpen}
                onConfirm={() => handleDeleteResponse && handleDeleteResponse(response)}
                onCancel={() => setIsDeleteModalOpen(false)}
              />
            </>
          );
        },
      },
    ],
    []
  );
