import { useQuery } from "@tanstack/react-query";
import { useLeadsApi } from "@/hooks/api/useLeadsApi";
import type { LeadsListDTO } from "@/interfaces/leads";

export const leadsKeys = {
  all: ["leads"] as const,
  list: (page?: number, limit?: number) => [...leadsKeys.all, "list", { page, limit }] as const,
  byId: (id: string) => [...leadsKeys.all, "byId", id] as const,
};

export function useLeadsList(page: number = 1, limit: number = 25) {
  const api = useLeadsApi();
  return useQuery<LeadsListDTO>({
    queryKey: leadsKeys.list(page, limit),
    queryFn: () => api.list({ page, limit }),
    staleTime: 60_000,
  });
}
