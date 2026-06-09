import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form as RHFForm } from "@/components/ui/form";
import { toast } from "sonner";
import { FormSchema, FormType } from "@/schemas/formBuilderSchema";
import FormBuilder from "@/components/dynamicForms/FormBuilder";
import { getNestedError } from "@/lib/utils";
import useFormPresetQuery from "@/hooks/queries/formPresets/useFormPresetQuery";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "@/components/ui/Loader";
import ErrorPage from "./ErrorPage";
import { useEffect, useMemo } from "react";
import useAddFormPreset from "@/hooks/mutations/formPresets/useAddFormPreset";
import useUpdateFormPreset from "@/hooks/mutations/formPresets/useUpdateFormPreset";
import { IForm } from "@/interfaces/IForm";
import useFormPresetsQuery from "@/hooks/queries/formPresets/useFormPresetsQuery";
import DateUtils from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";
import {
  FaArrowRight,
  FaClipboardList,
  FaFloppyDisk,
  FaSpinner,
} from "react-icons/fa6";

const FormBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== "add";
  const { data: formRes, isLoading, error } = useFormPresetQuery(isEdit ? id : undefined);
  const { data: formPresetsRes } = useFormPresetsQuery();
  const { mutate: addForm, isPending: isAddFormPending } = useAddFormPreset();
  const { mutate: updateForm, isPending: isUpdateFormPending } = useUpdateFormPreset(id);

  const emptyDefaults: FormType = {
    name: "",
    type: "general",
    repeatMonthly: false,
    sections: [],
  };
  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: emptyDefaults,
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    watch,
    reset,
  } = form;

  const sections = watch("sections");
  const formName = watch("name");
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
    if (formPreset.showOn) {
      formPreset.showOn = DateUtils.formatDate(formPreset.showOn, "YYYY-MM-DD");
    }
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
    if (!isEdit) {
      reset(emptyDefaults);
      return;
    }
    if (!formRes) return;
    reset(formRes.data);
  }, [formRes, isEdit, reset]);

  if (isLoading) return <Loader size="xl" />;
  if (error && error.status !== 404) return <ErrorPage />;

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-5 p-1"
      style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
    >
      <RHFForm {...form}>
        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
        >
          {/* Top bar — back, title, save */}
          <div className="sticky top-0 z-30 -mx-1 flex flex-wrap items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-slate-900/75">
            <button
              type="button"
              onClick={() => navigate("/form-builder")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40"
              aria-label="חזרה"
            >
              <FaArrowRight size={13} />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl brand-gradient text-white shadow-sm">
                <FaClipboardList size={14} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
                  {isEdit ? formName || "עריכת שאלון" : "שאלון חדש"}
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {sections?.length || 0} {sections?.length === 1 ? "קטגוריה" : "קטגוריות"}
                </p>
              </div>
            </div>

            <div className="ms-auto flex items-center gap-2">
              <Button
                type="submit"
                disabled={disableButton}
                className="gap-2 brand-gradient brand-gradient-hover text-white shadow-sm disabled:opacity-50"
              >
                {buttonLoadingState ? (
                  <FaSpinner size={12} className="animate-spin" />
                ) : (
                  <FaFloppyDisk size={12} />
                )}
                {buttonLoadingState ? "שומר…" : "שמור שאלון"}
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="mx-auto w-full max-w-[860px]">
            <FormBuilder disableOnboarding={disableOnboardingType} />
          </div>
        </form>
      </RHFForm>
    </div>
  );
};

export default FormBuilderPage;
