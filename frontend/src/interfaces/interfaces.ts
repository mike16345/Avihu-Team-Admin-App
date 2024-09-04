import { ApiResponse } from "@/types/types";
import { UseMutationResult } from "@tanstack/react-query";

interface ITabHeader {
  name: string;
  value: string;
}

interface ITabContent {
  value: string;
  btnPrompt: string;
  state?: any[];
  sheetForm: string;
  deleteFunc: UseMutationResult<unknown, Error, string, unknown>;
}

export interface ITabs {
  tabHeaders: ITabHeader[];
  tabContent: ITabContent[];
}
