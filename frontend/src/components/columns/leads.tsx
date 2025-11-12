import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import DeleteLeadAlert from "@/components/leads/DeleteLeadAlert";
import type { Lead } from "@/interfaces/leads";

const DATE_FORMAT = "dd/MM/yyyy HH:mm";

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
          return format(new Date(iso), DATE_FORMAT);
        },
      },
      {
        accessorKey: "deviceId",
        header: "Device",
        cell: ({ row }) => row.original.deviceId ?? "-",
      },
      {
        accessorKey: "ip",
        header: "IP",
        cell: ({ row }) => (row.original.ip ? <span dir="ltr">{row.original.ip}</span> : "-"),
      },
      {
        id: "actions",
        header: "פעולות",
        cell: ({ row }) => (
          <DeleteLeadAlert
            lead={row.original}
            disabled={isDeleting}
            onConfirm={() => onDelete(row.original)}
          />
        ),
      },
    ],
    [isDeleting, onDelete]
  );

export type { LeadsColumnsOptions };
