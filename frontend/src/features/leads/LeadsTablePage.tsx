import { useEffect, useState } from "react";

import { DataTableHebrew } from "@/components/tables/DataTableHebrew";
import ErrorPage from "@/pages/ErrorPage";
import { useLeadsList } from "@/hooks/queries/leads";
import { useDeleteLead } from "@/hooks/mutations/leads";
import { useLeadsColumns } from "@/components/columns/leads";
import type { Lead } from "@/interfaces/leads";

const LeadsTablePage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useLeadsList(page, limit);
  const { mutate: deleteLead, isPending: isDeleting } = useDeleteLead();

  const leads = data?.items ?? [];
  const [total, setTotal] = useState(1);

  useEffect(() => {
    if (!data) return;

    const maxPage = Math.max(1, Math.ceil(data.total / limit));

    setPage((prev) => {
      return prev > maxPage ? maxPage : prev;
    });

    const total = data.total ? Math.max(1, Math.ceil(data.total / limit)) : 1;
    setTotal(total);
  }, [data, limit]);

  const columns = useLeadsColumns({
    onDelete: (lead: Lead) => deleteLead(lead._id),
    isDeleting,
  });

  if (isError) {
    return <ErrorPage message={error?.message ?? "שגיאה בטעינת הלידים"} />;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">לידים</h1>
      <DataTableHebrew
        data={leads}
        getRowId={(row) => row._id || ""}
        columns={columns}
        isLoadingNextPage={isLoading}
        handleSetData={() => {}}
        handleViewData={() => {}}
        handleDeleteData={(lead: Lead) => deleteLead(lead._id)}
        handleViewNestedData={() => {}}
        getRowClassName={() => ""}
        handleHoverOnRow={() => false}
        pageNumber={page}
        pageCount={total}
        onPageChange={(nextPage) => {
          const safePage = Math.min(Math.max(nextPage, 1), total);
          setPage(safePage);
        }}
      />
    </div>
  );
};

export default LeadsTablePage;
