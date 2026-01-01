import useDeleteFormPreset from "@/hooks/mutations/formPresets/useDeleteFormPreset";
import { IForm } from "@/interfaces/IForm";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import { DataTableHebrew } from "@/components/tables/DataTableHebrew";
import { Button } from "@/components/ui/button";
import { columns as formColumns } from "@/components/tables/Columns/forms/FormColumns";
import useFormPresetsQuery from "@/hooks/queries/formPresets/useFormPresetsQuery";

const FormPresetsPage = () => {
  const navigate = useNavigate();
  const { data: formPresetsRes, isLoading, isError, error } = useFormPresetsQuery();
  const formMutation = useDeleteFormPreset();

  const handleViewForm = (form: IForm) => {
    navigate(`/form-builder/${form._id}`);
  };

  if (isLoading) return <Loader size="large" />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <>
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
      />
    </>
  );
};

export default FormPresetsPage;
