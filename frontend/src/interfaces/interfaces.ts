import { UseMutationResult } from "@tanstack/react-query";

interface ITabHeader {
  name: string;
  value: string;
  queryKey: string;
}

interface ITabContent {
  value: string;
  btnPrompt: string;
  sheetForm: string;
  deleteFunc: UseMutationResult<unknown, Error, string, unknown>;
}

export interface ITabs {
  tabHeaders: ITabHeader[];
  tabContent: ITabContent[];
}

export interface PaginationParams {
  limit: number;
  page: number;
}

export interface PaginationResult<T> {
  results: T[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
