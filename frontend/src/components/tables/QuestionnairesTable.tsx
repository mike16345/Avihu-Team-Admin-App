import useDeleteFormPreset from "@/hooks/mutations/formPresets/useDeleteFormPreset";
import useFormPresetsQuery from "@/hooks/queries/formPresets/useFormPresetsQuery";
import ErrorPage from "@/pages/ErrorPage";
import Loader from "../ui/Loader";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import FormPresetGrid from "../forms/FormPresetGrid";
import { FaPenToSquare, FaPlus } from "react-icons/fa6";

const QuestionnairesTable = () => {
  const navigate = useNavigate();

  const { data: formPresetsRes, isLoading, isError, error } = useFormPresetsQuery();
  const formMutation = useDeleteFormPreset();
  const forms = formPresetsRes?.data || [];
  const onboardingForm = forms.find((form) => form.type === "onboarding");

  if (isLoading) return <Loader size="large" />;
  if (isError) return <ErrorPage message={error.message} />;

  return (
    <FormPresetGrid
      data={forms}
      onView={(id) => navigate(`/form-builder/${id}`)}
      onDelete={(id) => formMutation.mutate(id)}
      actionButton={
        <div className="flex flex-wrap gap-2">
          {onboardingForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/form-builder/${onboardingForm._id}`)}
              className="gap-2"
            >
              <FaPenToSquare size={11} />
              ערוך שאלון התחלה
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => navigate(`/form-builder/add`)}
            className="gap-2 brand-gradient brand-gradient-hover text-white shadow-sm"
          >
            <FaPlus size={11} />
            הוסף שאלון
          </Button>
        </div>
      }
    />
  );
};

export default QuestionnairesTable;
