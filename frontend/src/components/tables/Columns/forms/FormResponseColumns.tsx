import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormTypesInHebrew } from "@/constants/form";
import DateUtils from "@/lib/dateUtils";
import { FormResponse } from "@/interfaces/IFormResponse";
import { FormTypes } from "@/interfaces/IForm";
import { resolveUserName } from "@/components/agreements/SignedAgreementsTable";

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
        accessorFn: (row) => row.formTitle ?? row.formId?.name ?? "",
        header: ({ column }) => (
          <Button
            className="m-0 px-1 py-1"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            שם
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const name = row.original.formTitle ?? row.original.formId?.name;
          return name || "-";
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
        accessorKey: "userId",
        header: "משתמש",
        cell: ({ row }) => {
          return resolveUserName(row.original.userId) || "-";
        },
      },
      {
        accessorKey: "submittedAt",
        header: "נענתה בתאריך",
        cell: ({ row }) => formatSubmittedAt(row.original.submittedAt),
      },
    ],
    []
  );
