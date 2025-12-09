import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLeadsApi } from "@/hooks/api/useLeadsApi";
import { leadsKeys } from "@/hooks/queries/leads";
import type { LeadId, UpdateLeadBody } from "@/interfaces/leads";

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

export function useUpdateLead() {
  const api = useLeadsApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: LeadId; body: UpdateLeadBody }) => api.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });
}
