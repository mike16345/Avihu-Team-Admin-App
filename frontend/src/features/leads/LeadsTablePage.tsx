import { useEffect, useState } from "react";

import { DataTableHebrew } from "@/components/tables/DataTableHebrew";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { useLeadsList } from "@/hooks/queries/leads";
import { useDeleteLead } from "@/hooks/mutations/leads";
import { useLeadsColumns } from "@/components/columns/leads";
import type { Lead } from "@/interfaces/leads";

const LeadsTablePage = () => {
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading, isError, error } = useLeadsList(page, limit);
  const { mutate: deleteLead, isPending: isDeleting } = useDeleteLead();

  const leads = data?.items ?? [];
  console.log("data", data);
  const totalPages = data ? Math.max(1, Math.ceil(data.total / limit)) : 1;

  useEffect(() => {
    if (!data) return;

    const maxPage = Math.max(1, Math.ceil(data.total / limit));

    setPage((prev) => {
      return prev > maxPage ? maxPage : prev;
    });
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
        columns={columns}
        isLoadingNextPage={isLoading}
        handleSetData={() => {}}
        handleViewData={() => {}}
        handleDeleteData={(lead: Lead) => deleteLead(lead._id)}
        handleViewNestedData={() => {}}
        getRowClassName={() => ""}
        handleHoverOnRow={() => false}
        pageNumber={page}
        pageCount={totalPages}
        onPageChange={(nextPage) => {
          const safePage = Math.min(Math.max(nextPage, 1), totalPages);
          setPage(safePage);
        }}
      />
    </div>
  );
};

export default LeadsTablePage;
