import useDeleteFormPreset from "@/hooks/mutations/formPresets/useDeleteFormPreset";
import useFormPresetsQuery from "@/hooks/queries/formPresets/useFormPresetsQuery";
import ErrorPage from "@/pages/ErrorPage";
import { DataTableHebrew } from "./DataTableHebrew";
import Loader from "../ui/Loader";
import { columns as formColumns } from "@/components/tables/Columns/forms/FormColumns";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { IForm } from "@/interfaces/IForm";

const QuestionnairesTable = () => {
  const navigate = useNavigate();

  const { data: formPresetsRes, isLoading, isError, error } = useFormPresetsQuery();
  const formMutation = useDeleteFormPreset();
  const onboardingForm = formPresetsRes?.data?.find((form) => form.type === "onboarding");

  const handleViewForm = (form: IForm) => {
    navigate(`/form-builder/${form._id}`);
  };

  return (
    <>
      {isLoading ? (
        <Loader size="large" />
      ) : isError ? (
        <ErrorPage message={error.message} />
      ) : (
        <DataTableHebrew
          data={formPresetsRes?.data || []}
          columns={formColumns}
          paginationKey="forms"
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
    </>
  );
};

export default QuestionnairesTable;
