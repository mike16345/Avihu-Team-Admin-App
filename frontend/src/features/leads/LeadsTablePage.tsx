import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { DataTableHebrew } from "@/components/tables/DataTableHebrew";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { useLeadsList } from "@/hooks/queries/leads";
import { useDeleteLead } from "@/hooks/mutations/leads";
import type { Lead } from "@/services/api/leads.api";

const DATE_FORMAT = "dd/MM/yyyy HH:mm";

const LeadsTablePage = () => {
  const [page] = useState(1);
  const limit = 25;

  const { data, isLoading, isError, error } = useLeadsList(page, limit);
  const deleteLead = useDeleteLead();

  const leads = data?.items ?? [];

  const columns = useMemo<ColumnDef<Lead>[]>(
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
        cell: ({ row }) => {
          const id = row.original._id;
          return (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" data-testid={`lead-delete-${id}`}>
                  מחק
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>למחוק ליד זה?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>בטל</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteLead.mutate(id)} disabled={deleteLead.isPending}>
                    מחק
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        },
      },
    ],
    [deleteLead]
  );

  if (isLoading) {
    return <Loader size="large" />;
  }

  if (isError) {
    return <ErrorPage message={error?.message ?? "שגיאה בטעינת הלידים"} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">לידים</h1>
      <DataTableHebrew
        data={leads}
        columns={columns}
        handleSetData={() => {}}
        handleViewData={() => {}}
        handleDeleteData={(lead) => deleteLead.mutate(lead._id)}
        handleViewNestedData={() => {}}
        getRowClassName={() => ""}
        handleHoverOnRow={() => false}
      />
    </div>
  );
};

export default LeadsTablePage;
