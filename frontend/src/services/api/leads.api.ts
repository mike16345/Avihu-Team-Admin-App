import type { AxiosResponse } from "axios";
import axiosInstance from "@/config/apiConfig";

export type LeadId = string;

export interface Lead {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  deviceId?: string;
  ip?: string;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsListDTO {
  items: Lead[];
  page: number;
  limit: number;
  total: number;
}

export interface LeadsListResponse {
  data: LeadsListDTO;
}

export interface LeadResponse {
  data: Lead;
}

export interface CreateLeadBody {
  fullName: string;
  email: string;
  phone?: string;
  deviceId?: string;
  registeredAt?: string;
}

export interface UpdateLeadBody {
  fullName?: string;
  email?: string;
  phone?: string;
  deviceId?: string;
  registeredAt?: string;
}

export function useLeadsApi() {
  const base = "/leads";

  const list = async (params?: { page?: number; limit?: number }): Promise<LeadsListDTO> => {
    const res: AxiosResponse<LeadsListResponse> = await axiosInstance.get(base, { params });
    return res.data.data;
  };

  const getById = async (id: LeadId): Promise<Lead> => {
    const res: AxiosResponse<LeadResponse> = await axiosInstance.get(`${base}/${id}`);
    return res.data.data;
  };

  const create = async (body: CreateLeadBody): Promise<Lead> => {
    const res: AxiosResponse<LeadResponse> = await axiosInstance.post(base, body);
    return res.data.data;
  };

  const update = async (id: LeadId, body: UpdateLeadBody): Promise<Lead> => {
    const res: AxiosResponse<LeadResponse> = await axiosInstance.put(`${base}/${id}`, body);
    return res.data.data;
  };

  const remove = async (id: LeadId): Promise<void> => {
    await axiosInstance.delete(`${base}/${id}`);
  };

  return { list, getById, create, update, remove };
}
