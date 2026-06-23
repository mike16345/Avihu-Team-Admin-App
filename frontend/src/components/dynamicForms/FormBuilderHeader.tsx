import CustomSelect from "../ui/CustomSelect";
import { FormTypeOptions } from "@/constants/form";
import DatePicker from "../ui/DatePicker";
import { useFormContext } from "react-hook-form";
import { FormType } from "@/schemas/formBuilderSchema";
import { FormField, FormItem, FormMessage } from "../ui/form";
import { useEffect } from "react";
import AutoResizer from "../ui/AutoResizer";
import { Option } from "@/types/types";
import {
  FaClipboardList,
  FaTag,
  FaShapes,
  FaCalendarDays,
  FaCircleInfo,
  FaPlay,
  FaRepeat,
  FaCalendarCheck,
} from "react-icons/fa6";

interface FormBuilderHeaderProps {
  formTypeOptions?: Option[];
  disableOnboarding?: boolean;
}

const TYPE_INFO: Record<string, { icon: React.ReactNode; bg: string; text: string; copy: string }> =
  {
    onboarding: {
      icon: <FaPlay size={11} />,
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-300",
      copy: "השאלון יוצג רק בכניסה הראשונה של המתאמן למערכת.",
    },
    monthly: {
      icon: <FaRepeat size={11} />,
      bg: "bg-violet-50 dark:bg-violet-950/40",
      text: "text-violet-700 dark:text-violet-300",
      copy: "השאלון יוצג אוטומטית בכל ה-1 בחודש.",
    },
    general: {
      icon: <FaCalendarCheck size={11} />,
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-300",
      copy: "השאלון יוצג למתאמנים בתאריך שתבחר.",
    },
  };

const FormBuilderHeader = ({
  formTypeOptions = FormTypeOptions,
  disableOnboarding = false,
}: FormBuilderHeaderProps) => {
  const {
    control,
    watch,
    formState: { errors },
    setValue,
  } = useFormContext<FormType>();
  const formType = watch("type");

  const availableTypeOptions = disableOnboarding
    ? formTypeOptions.filter((option) => option.value !== "onboarding")
    : formTypeOptions;
  const headerError = Boolean(errors.name || errors.type || errors.showOn);
  const info = TYPE_INFO[formType] ?? TYPE_INFO.general;

  useEffect(() => {
    if (!formType) return;

    if (disableOnboarding && formType === "onboarding") {
      setValue("type", "general");
    }

    if (formType !== "general") setValue("showOn", undefined);

    setValue("repeatMonthly", formType == "monthly");
  }, [formType, disableOnboarding, setValue]);

  return (
    <div
      dir="rtl"
      className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-colors ${
        headerError
          ? "border-rose-300 dark:border-rose-700"
          : "border-slate-200 dark:border-slate-800"
      }`}
      style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
    >
      {/* Decorative gradient corner */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-blue-100/60 dark:bg-blue-950/30 blur-3xl" />

      <div className="relative flex flex-col gap-5 p-5">
        {/* Title row */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl brand-gradient text-white shadow-md">
            <FaClipboardList size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">פרטי השאלון</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              שם, סוג ותזמון — אלו הפרטים שמופיעים למתאמן ברגע שהשאלון משויך אליו
            </p>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
          <FormField
            name="name"
            control={control}
            render={({ field }) => (
              <FormItem className="w-full">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <FaTag size={9} />
                  שם השאלון
                </label>
                <AutoResizer
                  {...field}
                  placeholder="לדוגמה: שאלון התאמה מקצועי למתאמן"
                  className="mt-1.5 text-base font-semibold"
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="type"
            control={control}
            render={({ field }) => (
              <FormItem className="w-full">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <FaShapes size={9} />
                  סוג השאלון
                </label>
                <CustomSelect
                  className="mt-1.5 w-full bg-slate-50 dark:bg-slate-800/60"
                  items={availableTypeOptions}
                  onValueChange={field.onChange}
                  selectedValue={field.value}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Date picker — only for scheduled */}
        {formType === "general" && (
          <FormField
            name="showOn"
            control={control}
            render={({ field }) => (
              <FormItem className="w-full md:max-w-[280px]">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <FaCalendarDays size={9} />
                  תאריך הצגה
                </label>
                <div className="mt-1.5">
                  <DatePicker onChangeDate={field.onChange} selectedDate={field.value} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Info banner — explains what the type means */}
        <div
          className={`flex items-start gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 p-3 ${info.bg}`}
        >
          <div
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${info.text}`}
          >
            <FaCircleInfo size={12} />
          </div>
          <div className="flex-1">
            <div className={`flex items-center gap-1.5 text-xs font-bold ${info.text}`}>
              {info.icon}
              {formType === "onboarding" ? "התחלה" : formType === "monthly" ? "חודשי" : "מתוזמן"}
            </div>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{info.copy}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilderHeader;
