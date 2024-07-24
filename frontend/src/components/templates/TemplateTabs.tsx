import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PresetTable from '@/components/tables/PresetTable'
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PresetSheet from './workoutTemplates/exercises/PresetSheet';




interface TemplateTabsProps {
    tabs: ITabs
}


const TemplateTabs: React.FC<TemplateTabsProps> = ({ tabs }) => {


    const [selectedForm, setSelectedForm] = useState<string | undefined>()
    const [selectedObjectId, setSelectedObjectId] = useState<string>()

    const deleteItem = (
        id: string,
        deleteFunc: (id: string) => Promise<unknown>,
    ) => {
        deleteFunc(id)
            .then(() => toast.success(`פריט נמחק בהצלחה!`))
            .catch(err => toast.error(`אופס! נתקלנו בבעיה`,
                { description: err.response.data.message }
            ))
    }

    const startEdit = (id: string, formToUse: string) => {
        setSelectedForm(formToUse);
        setSelectedObjectId(id);
    }


    return (
        <div>
            <div>
                <Tabs defaultValue={tabs.tabHeaders[0].value} dir='rtl'>
                    <TabsList>
                        {tabs.tabHeaders.map(tab => (
                            <TabsTrigger key={tab.value} value={tab.value}>{tab.name}</TabsTrigger>
                        ))}
                    </TabsList>

                    {tabs.tabContent.map(tab => (
                        <TabsContent key={tab.value} value={tab.value}>
                            <Button
                                onClick={() => setSelectedForm(tab.sheetForm)}
                                className='my-4'
                            >{tab.btnPrompt}</Button>
                            <PresetTable
                                data={tab.state}
                                handleDelete={(id) => deleteItem(id, tab.deleteFunc)}
                                retrieveObjectId={(id: string) => startEdit(id, tab.sheetForm)}
                            />
                        </TabsContent>
                    ))}

                </Tabs>
            </div>
            {selectedForm &&
                <PresetSheet
                    form={selectedForm}
                    id={selectedObjectId}
                    setForm={setSelectedForm}
                    setId={setSelectedObjectId}
                />
            }
        </div>
    )
}

export default TemplateTabs
