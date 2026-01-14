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

const FormPresetsPage = () => {
  const navigate = useNavigate();
  const { data: formPresetsRes, isLoading, isError, error } = useFormPresetsQuery();
  const formMutation = useDeleteFormPreset();

  const handleViewForm = (form: IForm) => {
    navigate(`/form-builder/${form._id}`);
  };

  return (
    <Tabs dir="rtl" defaultValue="forms" className="w-full">
      <TabsList>
        <TabsTrigger value="forms">שאלונים</TabsTrigger>
        <TabsTrigger value="responses">תשובות</TabsTrigger>
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
            actionButton={<Button onClick={() => navigate(`/form-builder/add`)}>הוסף שאלון</Button>}
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
    </Tabs>
  );
};

export default FormPresetsPage;
