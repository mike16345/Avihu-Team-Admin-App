import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PresetTable from '@/components/tables/PresetTable'
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';



interface TemplateTabsProps {
    tabs: ITabs
}


const TemplateTabs: React.FC<TemplateTabsProps> = ({ tabs }) => {


    const navigate = useNavigate()

    

    const deleteItem = (
        id: string,
        deleter: (id: string) => Promise<unknown>,
    ) => {
        deleter(id)
            .then(() => toast.success(`פריט נמחק בהצלחה!`))
            .catch(err => toast.error(`אופס! נתקלנו בבעיה`,
                { description: err.response.data }
            ))
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
                            handleDelete={(id) => deleteItem(id, tab.setter)}
                            navURL={tab.navURL}
                        />
                    </TabsContent>
                ))}

            </Tabs>

        </div>
    )
}

export default TemplateTabs
