interface ITabHeader {
    name: string;
    value: string
}

interface ITabContent {
    value: string;
    btnPrompt: string;
    state?: any[];
    sheetForm: string;
    deleteFunc: (id: string) => Promise<unknown>
}

interface ITabs {
    tabHeaders: ITabHeader[],
    tabContent: ITabContent[]
}