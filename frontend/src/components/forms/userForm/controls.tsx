import type { ReactNode } from "react";
import { FaChevronDown, FaUserTie } from "react-icons/fa6";
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
    <div className="relative">
      <select
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls(!!error)} cursor-pointer appearance-none pe-9`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FaChevronDown
        size={10}
        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
      />
    </div>
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
        <div className="relative">
          <FaUserTie
            size={12}
            className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <select
            data-testid="user-form-sub-trainer"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLoading}
            className={`${inputCls(false)} cursor-pointer appearance-none ps-9 pe-9`}
          >
            {options.map((option) => (
              <option key={option.value || "main"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FaChevronDown
            size={10}
            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
        </div>
      </Field>
    </div>
  );
}
