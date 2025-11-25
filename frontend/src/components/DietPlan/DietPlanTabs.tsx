import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import React from "react";

interface DietplanTabsProps {
  dietplan: React.ReactNode;
  tips: React.ReactNode;
  supplements: React.ReactNode;
}

const DietplanTabs: React.FC<DietplanTabsProps> = ({ dietplan, tips, supplements }) => {
  return (
    <Tabs defaultValue="dietplan" dir="rtl">
      <TabsList>
        <TabsTrigger value="dietplan">תפריט תזונה</TabsTrigger>
        <TabsTrigger value="tips">דגשים</TabsTrigger>
        <TabsTrigger value="supplements">תוספים</TabsTrigger>
      </TabsList>
      <TabsContent value="dietplan">{dietplan}</TabsContent>
      <TabsContent value="tips">{tips}</TabsContent>
      <TabsContent value="supplements">{supplements}</TabsContent>
    </Tabs>
  );
};

export default DietplanTabs;
