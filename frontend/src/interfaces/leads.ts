import { ApiResponse } from "@/types/types";

export type LeadId = string;

export type Lead = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  deviceId?: string;
  ip?: string;
  isContacted: boolean;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateLeadBody = {
  fullName: string;
  email: string;
  phone?: string;
  deviceId?: string;
  registeredAt?: string;
};

export type UpdateLeadBody = {
  fullName?: string;
  email?: string;
  phone?: string;
  deviceId?: string;
  registeredAt?: string;
  isContacted?: boolean;
};

export type LeadsListDTO = {
  items: Lead[];
  page: number;
  limit: number;
  total: number;
};

export type LeadsListResponse = ApiResponse<LeadsListDTO>;

export type LeadResponse = ApiResponse<Lead>;
