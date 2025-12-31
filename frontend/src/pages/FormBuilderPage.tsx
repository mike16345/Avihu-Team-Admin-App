import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form as RHFForm } from "@/components/ui/form";
import { toast } from "sonner";

import { FormSchema, Form as FormType } from "@/schemas/formBuilderSchema";
import CustomButton from "@/components/ui/CustomButton";
import FormBuilder from "@/components/dynamicForms/FormBuilder";
import { getNestedError } from "@/lib/utils";

const FormBuilderPage = () => {
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
  } = form;

  /* ---------- Submit ---------- */

  const onSubmit = (values: FormType) => {
    console.log("FORM PAYLOAD:", values);

    toast.success("הטופס נשמר בהצלחה!");
    // mutation goes here
  };

  const onInvalidSubmit = (errors: any) => {
    const errorMessage = getNestedError(errors);

    toast.error(errorMessage?.title, {
      description: errorMessage?.description,
    });
  };

  return (
    <RHFForm {...form}>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
      >
        {/* ---------- Builder ---------- */}
        <FormBuilder />

        {/* ---------- Actions ---------- */}
        <div className="flex justify-end gap-2 sticky bottom-0 w-fit mr-auto py-2">
          <CustomButton
            type="submit"
            title="שמור טופס"
            variant="success"
            disabled={!isDirty || isSubmitting}
            isLoading={isSubmitting}
          />
        </div>
      </form>
    </RHFForm>
  );
};

export default FormBuilderPage;
