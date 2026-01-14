import useDeleteFormPreset from "@/hooks/mutations/formPresets/useDeleteFormPreset";
import { IForm } from "@/interfaces/IForm";
import { useNavigate } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import { DataTableHebrew } from "@/components/tables/DataTableHebrew";
import { Button } from "@/components/ui/button";
import { columns as formColumns } from "@/components/tables/Columns/forms/FormColumns";
import useFormPresetsQuery from "@/hooks/queries/formPresets/useFormPresetsQuery";
import Loader from "@/components/ui/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormResponsesTable from "@/components/tables/FormResponsesTable";
import SignedAgreementsTable from "@/components/agreements/SignedAgreementsTable";

const FormPresetsPage = () => {
  const navigate = useNavigate();
  const { data: formPresetsRes, isLoading, isError, error } = useFormPresetsQuery();
  const formMutation = useDeleteFormPreset();
  const onboardingForm = formPresetsRes?.data?.find((form) => form.type === "onboarding");

  const handleViewForm = (form: IForm) => {
    navigate(`/form-builder/${form._id}`);
  };

  return (
    <Tabs dir="rtl" defaultValue="forms" className="w-full">
      <TabsList>
        <TabsTrigger value="forms">שאלונים</TabsTrigger>
        <TabsTrigger value="responses">תשובות</TabsTrigger>
        <TabsTrigger value="agreements">Agreement</TabsTrigger>
      </TabsList>
      <TabsContent value="forms">
        {isLoading ? (
          <Loader size="large" />
        ) : isError ? (
          <ErrorPage message={error.message} />
        ) : (
          <DataTableHebrew
            data={formPresetsRes?.data || []}
            columns={formColumns}
            actionButton={
              <div className="flex flex-wrap gap-2">
                {onboardingForm && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/form-builder/${onboardingForm._id}`)}
                  >
                    ערוך שאלון התחלה
                  </Button>
                )}
                <Button onClick={() => navigate(`/form-builder/add`)}>הוסף שאלון</Button>
              </div>
            }
            handleSetData={() => {}}
            handleViewData={(user) => handleViewForm(user)}
            getRowClassName={() => ""}
            getRowId={(row) => row._id || ""}
            handleDeleteData={(form) => formMutation.mutate(form._id || "")}
            handleViewNestedData={(_, formId) => navigate(`/form-builder/${formId}`)}
            handleHoverOnRow={() => false}
          />
        )}
      </TabsContent>
      <TabsContent value="responses">
        <FormResponsesTable />
      </TabsContent>
      <TabsContent value="agreements">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={() => navigate(`/agreements/current`)}>
            להסכם נוכחי
          </Button>
        </div>
        <SignedAgreementsTable />
      </TabsContent>
    </Tabs>
  );
};

export default FormPresetsPage;
