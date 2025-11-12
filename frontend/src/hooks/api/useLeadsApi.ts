import { deleteItem, fetchData, sendData, updateItem } from "@/API/api";
import type {
  CreateLeadBody,
  Lead,
  LeadId,
  LeadsListDTO,
  LeadsListResponse,
  LeadResponse,
  UpdateLeadBody,
} from "@/interfaces/leads";

export function useLeadsApi() {
  const base = "leads";

  const list = async (params?: { page?: number; limit?: number }): Promise<LeadsListDTO> => {
    const response = await fetchData<LeadsListResponse>(base, params);
    return response.data;
  };

  const getById = async (id: LeadId): Promise<Lead> => {
    const response = await fetchData<LeadResponse>(`${base}/${id}`);
    return response.data;
  };

  const create = async (body: CreateLeadBody): Promise<Lead> => {
    const response = await sendData<LeadResponse>(base, body);
    return response.data;
  };

  const update = async (id: LeadId, body: UpdateLeadBody): Promise<Lead> => {
    const response = (await updateItem(`${base}/${id}`, body)) as LeadResponse;
    return response.data;
  };

  const remove = async (id: LeadId): Promise<void> => {
    await deleteItem(`${base}/${id}`);
  };

  return { list, getById, create, update, remove };
}
