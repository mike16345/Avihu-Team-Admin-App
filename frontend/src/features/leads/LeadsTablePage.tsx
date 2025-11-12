import { useState } from "react";

import { DataTableHebrew } from "@/components/tables/DataTableHebrew";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { useLeadsList } from "@/hooks/queries/leads";
import { useDeleteLead } from "@/hooks/mutations/leads";
import { useLeadsColumns } from "@/components/columns/leads";
import type { Lead } from "@/interfaces/leads";

const LeadsTablePage = () => {
  const [page] = useState(1);
  const limit = 25;

  const { data, isLoading, isError, error } = useLeadsList(page, limit);
  const { mutate: deleteLead, isPending: isDeleting } = useDeleteLead();

  const leads = data?.items ?? [];

  const columns = useLeadsColumns({
    onDelete: (lead: Lead) => deleteLead(lead._id),
    isDeleting,
  });

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
        handleDeleteData={(lead: Lead) => deleteLead(lead._id)}
        handleViewNestedData={() => {}}
        getRowClassName={() => ""}
        handleHoverOnRow={() => false}
      />
    </div>
  );
};

export default LeadsTablePage;
