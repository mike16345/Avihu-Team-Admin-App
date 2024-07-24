import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PresetTable from "@/components/tables/PresetTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PresetSheet from "./workoutTemplates/exercises/PresetSheet";

interface TemplateTabsProps {
  tabs: ITabs;
}

const TemplateTabs: React.FC<TemplateTabsProps> = ({ tabs }) => {
  const [selectedForm, setSelectedForm] = useState<string | undefined>();
  const [selectedObjectId, setSelectedObjectId] = useState<string>();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const deleteItem = (id: string, deleteFunc: (id: string) => Promise<unknown>) => {
    deleteFunc(id)
      .then(() => toast.success(`פריט נמחק בהצלחה!`))
      .catch((err) =>
        toast.error(`אופס! נתקלנו בבעיה`, { description: err.response.data.message })
      );
  };

  const startEdit = (id: string, formToUse: string) => {
    setSelectedForm(formToUse);
    setSelectedObjectId(id);
  };

  const onCloseSheet = () => {
    console.log("on close sheet");
    setIsSheetOpen(false);
    setSelectedObjectId(undefined);
    setSelectedForm(undefined);
  };

  useEffect(() => {
    if (!selectedObjectId) return;

    setIsSheetOpen(true);
  }, [selectedObjectId]);

  return (
    <>
      <div>
        <Tabs defaultValue={tabs.tabHeaders[0].value} dir="rtl">
          <TabsList>
            {tabs.tabHeaders.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.tabContent.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <Button
                onClick={() => {
                  setSelectedForm(tab.sheetForm);
                  setIsSheetOpen(true);
                }}
                className="my-4"
              >
                {tab.btnPrompt}
              </Button>
              <PresetTable
                data={tab.state || []}
                handleDelete={(id) => deleteItem(id, tab.deleteFunc)}
                retrieveObjectId={(id: string) => startEdit(id, tab.sheetForm)}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <PresetSheet
        isOpen={isSheetOpen}
        onCloseSheet={onCloseSheet}
        form={selectedForm}
        id={selectedObjectId}
      />
    </>
  );
};

export default TemplateTabs;
