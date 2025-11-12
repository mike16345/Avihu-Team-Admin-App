import { useQuery } from "@tanstack/react-query";
import { useLeadsApi, type LeadsListDTO } from "@/services/api/leads.api";

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
