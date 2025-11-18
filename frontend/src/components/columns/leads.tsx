import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import DeleteLeadAlert from "@/components/leads/DeleteLeadAlert";
import type { Lead } from "@/interfaces/leads";
import DateUtils from "@/lib/dateUtils";

type LeadsColumnsOptions = {
  onDelete: (lead: Lead) => void;
  isDeleting?: boolean;
};

export const useLeadsColumns = ({ onDelete, isDeleting = false }: LeadsColumnsOptions) =>
  useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: "fullName",
        id: "שם",
        header: "שם מלא",
      },
      {
        accessorKey: "email",
        header: "אימייל",
        cell: ({ row }) => <span dir="ltr">{row.original.email}</span>,
      },
      {
        accessorKey: "phone",
        header: "טלפון",
        cell: ({ row }) => (row.original.phone ? <span dir="ltr">{row.original.phone}</span> : "-"),
      },
      {
        accessorKey: "registeredAt",
        header: "נרשם",
        cell: ({ row }) => {
          const iso = row.original.registeredAt ?? row.original.createdAt;
          if (!iso) return "-";
          const parsedDate = new Date(iso);
          if (Number.isNaN(parsedDate.getTime())) {
            return "-";
          }
          return DateUtils.formatDate(parsedDate, "DD/MM/YYYY");
        },
      },

      {
        id: "actions",
        header: "פעולות",
        cell: ({ row }) => (
          <DeleteLeadAlert
            lead={row.original}
            isLoading={isDeleting}
            onConfirm={() => onDelete(row.original)}
          />
        ),
      },
    ],
    [isDeleting, onDelete]
  );

export type { LeadsColumnsOptions };
