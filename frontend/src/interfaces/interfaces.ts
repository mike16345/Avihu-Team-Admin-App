import { ApiResponse } from "@/types/types";

interface ITabHeader {
  name: string;
  value: string;
}

interface ITabContent {
  value: string;
  btnPrompt: string;
  state?: any[];
  setState: React.Dispatch<React.SetStateAction<any[]>>;
  sheetForm: string;
  deleteFunc: (id: string) => Promise<unknown>;
}

export interface ITabs {
  tabHeaders: ITabHeader[];
  tabContent: ITabContent[];
}
