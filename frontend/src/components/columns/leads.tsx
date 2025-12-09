import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Lead } from "@/interfaces/leads";
import DateUtils from "@/lib/dateUtils";

type LeadsColumnsOptions = {
  onToggleContacted: (lead: Lead, nextValue: boolean) => void;
  pendingContactIds?: string[];
};

export const useLeadsColumns = ({ onToggleContacted, pendingContactIds = [] }: LeadsColumnsOptions) =>
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
        accessorKey: "isContacted",
        header: "נוצר קשר",
        cell: ({ row }) => {
          const lead = row.original;
          const isPending = pendingContactIds.includes(lead._id);

          return (
            <Checkbox
              checked={lead.isContacted}
              disabled={isPending}
              onClick={(event) => event.stopPropagation()}
              onCheckedChange={(checked) =>
                onToggleContacted(lead, Boolean(checked))
              }
              aria-label={`Mark lead ${lead.fullName ?? lead.email ?? lead._id} as contacted`}
            />
          );
        },
      },
    ],
    [onToggleContacted, pendingContactIds]
  );

export type { LeadsColumnsOptions };
