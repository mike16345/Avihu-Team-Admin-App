import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { DataTableHebrew } from "@/components/tables/DataTableHebrew";
import ErrorPage from "@/pages/ErrorPage";
import { useLeadsList } from "@/hooks/queries/leads";
import { useUpdateLead } from "@/hooks/mutations/leads";
import { useLeadsColumns } from "@/components/columns/leads";
import type { Lead } from "@/interfaces/leads";

const LeadsTablePage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = useLeadsList(page, limit);
  const { mutateAsync: updateLead } = useUpdateLead();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [pendingContactIds, setPendingContactIds] = useState<string[]>([]);
  const [total, setTotal] = useState(1);

  const sortLeads = useCallback((list: Lead[]) => {
    return [...list].sort((a, b) => {
      if (a.isContacted === b.isContacted) {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();

        if (Number.isNaN(aDate) || Number.isNaN(bDate)) {
          return 0;
        }

        return bDate - aDate;
      }

      return a.isContacted ? 1 : -1;
    });
  }, []);

  useEffect(() => {
    if (!data) return;

    const maxPage = Math.max(1, Math.ceil(data.total / limit));

    setPage((prev) => {
      return prev > maxPage ? maxPage : prev;
    });

    const totalPages = data.total ? Math.max(1, Math.ceil(data.total / limit)) : 1;
    setTotal(totalPages);

    if (data.items) {
      const normalizedLeads = data.items.map((lead) => ({
        ...lead,
        isContacted: Boolean(lead.isContacted),
      }));

      setLeads(sortLeads(normalizedLeads));
    }
  }, [data, limit, sortLeads]);

  const handleToggleContacted = useCallback(
    async (lead: Lead, nextValue: boolean) => {
      const previousLeads = leads.map((item) => ({ ...item }));

      setPendingContactIds((prev) =>
        prev.includes(lead._id) ? prev : [...prev, lead._id]
      );

      setLeads((current) =>
        sortLeads(
          current.map((item) =>
            item._id === lead._id ? { ...item, isContacted: nextValue } : item
          )
        )
      );

      try {
        const updatedLead = await updateLead({ id: lead._id, body: { isContacted: nextValue } });

        setLeads((current) =>
          sortLeads(
            current.map((item) =>
              item._id === lead._id ? { ...item, ...updatedLead } : item
            )
          )
        );
      } catch (error) {
        setLeads(previousLeads);
        toast.error("Failed to update lead status. Please try again.");
      } finally {
        setPendingContactIds((prev) => prev.filter((id) => id !== lead._id));
      }
    },
    [leads, sortLeads, updateLead]
  );

  const columns = useLeadsColumns({
    onToggleContacted: handleToggleContacted,
    pendingContactIds,
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
        handleDeleteData={() => {}}
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
