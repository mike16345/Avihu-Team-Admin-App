interface ITabHeader {
    name: string;
    value: string
}

interface ITabContent {
    value: string;
    navURL: string;
    btnPrompt: string;
    state: any[];
    setter: React.Dispatch<React.SetStateAction<any[]>>;
    endPoint: string
}

interface ITabs {
    tabHeaders: ITabHeader[],
    tabContent: ITabContent[]
}