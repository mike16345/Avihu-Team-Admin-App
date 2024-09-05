import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PresetTable from "@/components/tables/PresetTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PresetSheet from "./PresetSheet";
import { useNavigate } from "react-router-dom";
import { UseMutationResult } from "@tanstack/react-query";
import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { ITabs } from "@/interfaces/interfaces";

interface TemplateTabsProps {
  tabs: ITabs;
}

const TemplateTabs: React.FC<TemplateTabsProps> = ({ tabs }) => {
  const navigate = useNavigate();
  const [selectedForm, setSelectedForm] = useState<string | undefined>();
  const [selectedObjectId, setSelectedObjectId] = useState<string>();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const deleteItem = (
    id: string,
    deleteFunc: UseMutationResult<unknown, Error, string, unknown>
  ) => {
    deleteFunc.mutate(id);
    if (deleteFunc.isError) {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE, {
        description: deleteFunc.error.message,
      });
      return;
    }
    toast.success(`פריט נמחק בהצלחה!`);
  };

  const startEdit = (id: string, formToUse: string) => {
    if (formToUse === `dietPlans`) {
      navigate(`/presets/dietPlans/${id}`);
    } else if (formToUse === `workoutPlan`) {
      navigate(`/presets/workoutPlans/${id}`);
    } else {
      setSelectedForm(formToUse);
      setSelectedObjectId(id);
    }
  };

  const handleAddNew = (formToUse: string) => {
    if (formToUse === `dietPlans`) {
      navigate(`/presets/dietPlans`);
    } else if (formToUse === `workoutPlan`) {
      navigate(`/presets/workoutPlans/`);
    } else {
      setSelectedForm(formToUse);
      setIsSheetOpen(true);
    }
  };

  const onCloseSheet = () => {
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
              <Button onClick={() => handleAddNew(tab.sheetForm)} className="my-4">
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
