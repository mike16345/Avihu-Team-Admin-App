import type { ReactNode } from "react";
import { FaUserTie } from "react-icons/fa6";
import CustomSelect from "@/components/ui/CustomSelect";
import { useSubTrainersQuery } from "@/hooks/queries/subTrainers/useSubTrainersQuery";
import { inputCls } from "./styles";

export const SectionTitle = ({ icon, title }: { icon: ReactNode; title: string }) => (
  <div className="mb-2.5 flex items-center gap-1.5">
    {icon}
    <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">{title}</h2>
  </div>
);

export function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
        {required && <span className="ms-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <span data-testid={`error-${label}`} className="mt-0.5 text-xs font-semibold text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  placeholder,
  error,
  testId,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
  testId?: string;
}) {
  return (
    <CustomSelect
      testId={testId}
      items={options.map((option) => ({ name: option.label, value: option.value }))}
      selectedValue={value}
      onValueChange={onChange}
      placeholder={placeholder}
      className={`${inputCls(!!error)} h-9 cursor-pointer`}
    />
  );
}

export function TrainerAssignmentField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { data: subTrainers, isLoading } = useSubTrainersQuery();

  if (!isLoading && (!subTrainers || subTrainers.length === 0)) return null;

  const options = [
    { value: "", label: "אני (מאמן ראשי)" },
    ...((subTrainers ?? []).map((subTrainer: { _id: string; fullName: string }) => ({
      value: subTrainer._id,
      label: subTrainer.fullName,
    })) as { value: string; label: string }[]),
  ];

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
      <Field label="מאמן אחראי">
        <CustomSelect
          testId="user-form-sub-trainer"
          items={options.map((option) => ({ name: option.label, value: option.value }))}
          selectedValue={value}
          onValueChange={onChange}
          disabled={isLoading}
          startAdornment={<FaUserTie size={12} />}
          className={`${inputCls(false)} h-9 cursor-pointer`}
        />
      </Field>
    </div>
  );
}
