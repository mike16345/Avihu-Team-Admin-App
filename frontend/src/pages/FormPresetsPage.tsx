import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormResponsesTable from "@/components/tables/FormResponsesTable";
import SignedAgreementsTable from "@/components/agreements/SignedAgreementsTable";
import { useUrlTab } from "@/hooks/useUrlTab";
import QuestionnairesTable from "@/components/tables/QuestionnairesTable";
import { Button } from "@/components/ui/button";

const tabs = ["forms", "responses", "agreements"];

const FormPresetsPage = () => {
  const navigate = useNavigate();

  const { tab, setTab } = useUrlTab({ defaultTab: "forms", tabs });

  return (
    <Tabs dir="rtl" value={tab} onValueChange={setTab} className="w-full">
      <TabsList>
        <TabsTrigger value="forms">שאלונים</TabsTrigger>
        <TabsTrigger value="responses">תשובות</TabsTrigger>
        <TabsTrigger value="agreements">הסכמים</TabsTrigger>
      </TabsList>
      <TabsContent value="forms">
        <QuestionnairesTable />
      </TabsContent>
      <TabsContent value="responses">
        <FormResponsesTable paginationKey="responses" />
      </TabsContent>
      <TabsContent value="agreements">
        <div className="flex justify-end ml-4">
          <Button variant="outline" onClick={() => navigate(`/agreements/current`)}>
            להסכם נוכחי
          </Button>
        </div>
        <SignedAgreementsTable paginationKey="agreements" />
      </TabsContent>
    </Tabs>
  );
};

export default FormPresetsPage;
