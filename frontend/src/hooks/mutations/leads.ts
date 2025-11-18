import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLeadsApi } from "@/hooks/api/useLeadsApi";
import { leadsKeys } from "@/hooks/queries/leads";
import type { LeadId } from "@/interfaces/leads";

export function useDeleteLead() {
  const api = useLeadsApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: LeadId) => api.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });
}
