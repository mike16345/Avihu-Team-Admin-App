import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form as RHFForm } from "@/components/ui/form";
import { toast } from "sonner";
import { FormSchema, FormType } from "@/schemas/formBuilderSchema";
import CustomButton from "@/components/ui/CustomButton";
import FormBuilder from "@/components/dynamicForms/FormBuilder";
import { getNestedError } from "@/lib/utils";
import useFormPresetQuery from "@/hooks/queries/formPresets/useFormPresetQuery";
import { useParams } from "react-router-dom";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";
import { useEffect, useMemo } from "react";
import useAddFormPreset from "@/hooks/mutations/formPresets/useAddFormPreset";
import useUpdateFormPreset from "@/hooks/mutations/formPresets/useUpdateFormPreset";
import { IForm } from "@/interfaces/IForm";
import BackButton from "@/components/ui/BackButton";
import useFormPresetsQuery from "@/hooks/queries/formPresets/useFormPresetsQuery";

const FormBuilderPage = () => {
  const { id } = useParams();
  const isEdit = id !== "add";
  const { data: formRes, isLoading, error } = useFormPresetQuery(isEdit ? id : undefined);
  const { data: formPresetsRes } = useFormPresetsQuery();
  const { mutate: addForm, isPending: isAddFormPending } = useAddFormPreset();
  const { mutate: updateForm, isPending: isUpdateFormPending } = useUpdateFormPreset(id);

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      type: "general",
      repeatMonthly: false,
      sections: [],
    },
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    watch,
    reset,
  } = form;

  const sections = watch("sections");
  const disableButton = useMemo(
    () => !isDirty || isSubmitting || !sections.length,
    [isDirty, isSubmitting, sections]
  );
  const buttonLoadingState = useMemo(
    () => isSubmitting || isAddFormPending || isUpdateFormPending,
    [isSubmitting, isAddFormPending, isUpdateFormPending]
  );
  const existingOnboardingForm = useMemo(
    () => formPresetsRes?.data?.find((form) => form.type === "onboarding"),
    [formPresetsRes]
  );
  const disableOnboardingType = useMemo(() => {
    if (!existingOnboardingForm) return false;
    if (isEdit && existingOnboardingForm._id === id) return false;

    return true;
  }, [existingOnboardingForm, isEdit, id]);

  const onSubmit = (values: FormType) => {
    const formPreset = values as IForm;

    if (isEdit) {
      updateForm({ id: id!, formPreset });
    } else {
      addForm(formPreset);
    }
  };

  const onInvalidSubmit = (errors: any) => {
    const errorMessage = getNestedError(errors);

    toast.error("שגיאה בטופס, אנא בדוק את השדות המסומנים", {
      description: errorMessage?.description,
    });
  };

  useEffect(() => {
    if (!formRes) return;

    reset(formRes.data);
  }, [formRes]);

  if (isLoading) return <Loader size="xl" />;
  if (error && error.status !== 404) return <ErrorPage />;

  return (
    <>
      <BackButton fixedPosition navLink="/form-builder" />
      <RHFForm {...form}>
        <form
          className="flex flex-col gap-4 max-w-[800px] mx-auto"
          onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
        >
          <FormBuilder disableOnboarding={disableOnboardingType} />

          <div className="flex justify-end gap-2 sticky bottom-0 w-fit mr-auto py-2">
            <CustomButton
              type="submit"
              title="שמור טופס"
              variant="default"
              disabled={disableButton}
              isLoading={buttonLoadingState}
            />
          </div>
        </form>
      </RHFForm>
    </>
  );
};

export default FormBuilderPage;
