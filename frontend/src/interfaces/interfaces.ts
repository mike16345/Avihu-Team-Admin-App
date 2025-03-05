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
  deleteFunc: UseMutationResult<any, any, any, any>;
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

export interface IMutationProps<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
}

export interface IBaseItem {
  name: string;
}

export interface IPresetFormProps {
  objectId?: string;
  closeSheet: () => void;
}
