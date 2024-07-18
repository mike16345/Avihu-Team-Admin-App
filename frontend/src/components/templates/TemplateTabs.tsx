import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PresetTable from '@/components/tables/PresetTable'
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';



interface TemplateTabsProps {
    tabs: ITabs
}


const TemplateTabs: React.FC<TemplateTabsProps> = ({ tabs }) => {


    const navigate = useNavigate()

    const addItem = (
        item: string,
        arr: string[],
        arrSetter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        const newArr = [...arr];
        newArr.push(item);
        arrSetter(newArr)
    }

    const deleteItem = (
        index: number,
        arr: string[],
        arrSetter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {

        const filteredArr = arr.filter((_, i) => i !== index);
        arrSetter(filteredArr)

    }
    const editItem = (
        index: number,
        item: string,
        arr: string[],
        arrSetter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {

        const newArr = arr.map((arrItem, i) => i === index ? item : arrItem);
        arrSetter(newArr)

    }

    return (
        <div>
            <Tabs defaultValue={tabs.tabHeaders[0].value} dir='rtl'>
                <TabsList>
                    {tabs.tabHeaders.map(tab => (
                        <TabsTrigger value={tab.value}>{tab.name}</TabsTrigger>
                    ))}
                </TabsList>
                {tabs.tabContent.map(tab => (
                    <TabsContent value={tab.value}>
                        <Button
                            onClick={() => navigate(tab.navURL)}
                            className='my-4'
                        >{tab.btnPrompt}</Button>
                        <PresetTable
                            tempData={tab.state}
                            handleDelete={(i) => deleteItem(i, tab.state, tab.setter)}
                            endPoint={tab.endPoint}
                        />
                    </TabsContent>
                ))}

            </Tabs>

        </div>
    )
}

export default TemplateTabs
