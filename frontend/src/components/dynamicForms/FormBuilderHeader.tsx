import CustomSelect from "../ui/CustomSelect";
import { borderColor, FormTypeOptions } from "@/constants/form";
import DatePicker from "../ui/DatePicker";
import { useFormContext } from "react-hook-form";
import { FormType } from "@/schemas/formBuilderSchema";
import { FormField, FormItem, FormMessage } from "../ui/form";
import { useEffect, useMemo } from "react";
import { Input } from "../ui/input";
import { Option } from "@/types/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface FormBuilderHeaderProps {
  formTypeOptions?: Option[];
  disableOnboarding?: boolean;
  onboardingFormId?: string;
}

const FormBuilderHeader = ({
  formTypeOptions = FormTypeOptions,
  disableOnboarding = false,
  onboardingFormId,
}: FormBuilderHeaderProps) => {
  const {
    control,
    watch,
    formState: { errors },
    setValue,
  } = useFormContext<FormType>();
  const formType = watch("type");
  const navigate = useNavigate();

  const availableTypeOptions = useMemo(() => {
    if (!disableOnboarding) return formTypeOptions;
    return formTypeOptions.map((option) =>
      option.value === "onboarding"
        ? { ...option, name: `${option.name} (כבר קיים)` }
        : option
    );
  }, [disableOnboarding, formTypeOptions]);
  const headerError = Boolean(errors.name || errors.type || errors.showOn);

  useEffect(() => {
    if (!formType) return;

    if (disableOnboarding && formType === "onboarding") {
      setValue("type", "general");
    }

    if (formType !== "general") setValue("showOn", undefined);

    setValue("repeatMonthly", formType == "monthly");
  }, [formType, disableOnboarding, setValue]);

  return (
    <div className={`rounded-xl shadow-lg p-5 border space-y-3 ${borderColor[headerError as any]}`}>
      <div className="flex flex-col md:flex-row justify-between gap-5 items-start">
        <FormField
          name={`name`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <Input {...field} placeholder="שאלון ללא שם" />

                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          name={`type`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className="w-full md:w-[200px]">
                <CustomSelect
                  className="w-full bg-muted"
                  items={availableTypeOptions}
                  onValueChange={(value) => {
                    if (disableOnboarding && value === "onboarding") {
                      toast.info("כבר קיים שאלון התחלה.", {
                        description: "רוצה לצפות בו?",
                        action: onboardingFormId
                          ? {
                              label: "צפייה",
                              onClick: () => navigate(`/form-builder/${onboardingFormId}`),
                            }
                          : undefined,
                      });
                      return;
                    }

                    field.onChange(value);
                  }}
                  selectedValue={field.value}
                />
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>הסבר על סוג השאלון:</p>
        <ul className="list-disc pr-5 space-y-1">
          <li>כללי - השאלון יוצג בתאריך שנבחר.</li>
          <li>חודשי - השאלון יוצג בכל הראשון של החודש.</li>
          <li>התחלה - השאלון יוצג רק בכניסה הראשונה של המשתמש.</li>
        </ul>
      </div>
      {formType == "general" && (
        <FormField
          name={`showOn`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <DatePicker onChangeDate={field.onChange} selectedDate={field.value} />

                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}
    </div>
  );
};

export default FormBuilderHeader;
