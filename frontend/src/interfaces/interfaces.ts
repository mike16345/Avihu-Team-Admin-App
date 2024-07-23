interface ITabHeader {
    name: string;
    value: string
}

interface ITabContent {
    value: string;
    navURL: string;
    btnPrompt: string;
    state: any[];
    deleter: (id: string) => Promise<unknown>;
}

interface ITabs {
    tabHeaders: ITabHeader[],
    tabContent: ITabContent[]
}