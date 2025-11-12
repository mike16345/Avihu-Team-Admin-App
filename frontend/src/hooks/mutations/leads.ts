import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLeadsApi } from "@/services/api/leads.api";
import { leadsKeys } from "@/hooks/queries/leads";

export function useDeleteLead() {
  const api = useLeadsApi();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });
}
