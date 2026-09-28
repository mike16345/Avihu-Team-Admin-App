import { FaCalendarCheck, FaCalendarDays, FaCheck, FaXmark, FaUser } from "react-icons/fa6";
import DatePicker from "@/components/ui/DatePicker";
import UserPlanTypes from "@/enums/UserPlanTypes";
import { DATE_PRESETS, DIETARY_OPTIONS, REMIND_IN_OPTIONS } from "./options";
import { Field, SectionTitle, SelectInput, TrainerAssignmentField } from "./controls";
import { inputCls } from "./styles";
import type { UserFormErrors } from "./types";

const getDietaryOptionClassName = (selected: boolean) => {
  const baseClassName =
    "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all";

  if (selected) {
    return `${baseClassName} border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300`;
  }

  return `${baseClassName} border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700`;
};

const parseIsoDate = (value: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatIsoDate = (date: Date) => date.toISOString().split("T")[0];

export const PersonalDetailsSection = ({
  email,
  errors,
  firstName,
  lastName,
  phone,
  onEmailChange,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
}: {
  email: string;
  errors: UserFormErrors;
  firstName: string;
  lastName: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}) => (
  <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3">
    <SectionTitle icon={<FaUser size={11} className="text-blue-600" />} title="פרטים אישיים" />

    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
      <Field label="שם פרטי" error={errors.firstName} required>
        <input
          data-testid="user-form-first-name"
          type="text"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          placeholder="שם פרטי..."
          className={inputCls(!!errors.firstName)}
        />
      </Field>
      <Field label="שם משפחה" error={errors.lastName} required>
        <input
          data-testid="user-form-last-name"
          type="text"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          placeholder="שם משפחה..."
          className={inputCls(!!errors.lastName)}
        />
      </Field>
      <Field label="טלפון" error={errors.phone} required>
        <input
          data-testid="user-form-phone"
          type="tel"
          dir="ltr"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="0501234567"
          className={inputCls(!!errors.phone) + " text-center"}
        />
      </Field>
      <Field label="אימייל" error={errors.email} required>
        <input
          data-testid="user-form-email"
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="israel@example.com"
          className={inputCls(!!errors.email) + " text-center"}
        />
      </Field>
    </div>
  </div>
);

export const PlanAndCoachingSection = ({
  dateFinished,
  errors,
  planType,
  remindIn,
  subTrainerId,
  onApplyDatePreset,
  onDateFinishedChange,
  onPlanTypeChange,
  onRemindInChange,
  onSubTrainerChange,
}: {
  dateFinished: string;
  errors: UserFormErrors;
  planType: string;
  remindIn: number;
  subTrainerId: string;
  onApplyDatePreset: (days: number) => void;
  onDateFinishedChange: (value: string) => void;
  onPlanTypeChange: (value: string) => void;
  onRemindInChange: (value: number) => void;
  onSubTrainerChange: (value: string) => void;
}) => (
  <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3">
    <SectionTitle
      icon={<FaCalendarDays size={11} className="text-indigo-600" />}
      title="תוכנית וליווי"
    />

    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
      <Field label="סוג תוכנית" error={errors.planType} required>
        <SelectInput
          value={planType}
          onChange={onPlanTypeChange}
          placeholder="בחר סוג תוכנית"
          error={!!errors.planType}
          testId="user-form-plan-type"
          options={[
            { value: UserPlanTypes.CUT, label: UserPlanTypes.CUT },
            { value: UserPlanTypes.BULK, label: UserPlanTypes.BULK },
          ]}
        />
      </Field>
      <Field label="בדיקה תקופתית">
        <SelectInput
          value={String(remindIn)}
          onChange={(value) => onRemindInChange(Number(value))}
          placeholder="כל כמה זמן..."
          testId="user-form-remind-in"
          options={REMIND_IN_OPTIONS.map((option) => ({
            value: String(option.value),
            label: option.label,
          }))}
        />
      </Field>
      <DateFinishedField
        dateFinished={dateFinished}
        error={errors.dateFinished}
        onApplyDatePreset={onApplyDatePreset}
        onDateFinishedChange={onDateFinishedChange}
      />
    </div>

    <TrainerAssignmentField value={subTrainerId} onChange={onSubTrainerChange} />
  </div>
);

const DateFinishedField = ({
  dateFinished,
  error,
  onApplyDatePreset,
  onDateFinishedChange,
}: {
  dateFinished: string;
  error?: string;
  onApplyDatePreset: (days: number) => void;
  onDateFinishedChange: (value: string) => void;
}) => (
  <Field label="תאריך סיום הליווי" error={error} required>
    <div className="flex flex-col gap-2">
      <div className="relative">
        <FaCalendarCheck
          size={12}
          className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        />
        <DatePicker
          triggerTestId="user-form-date-finished"
          selectedDate={parseIsoDate(dateFinished)}
          onChangeDate={(date) => onDateFinishedChange(formatIsoDate(date))}
          placeholder="בחר תאריך סיום"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.days}
            type="button"
            onClick={() => onApplyDatePreset(preset.days)}
            data-testid="user-form-date-preset"
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  </Field>
);

export const DietaryRestrictionsSection = ({
  dietaryType,
  onDietaryToggle,
}: {
  dietaryType: string[];
  onDietaryToggle: (item: string) => void;
}) => (
  <div className="px-4 py-3">
    <SectionTitle icon={<FaCheck size={11} className="text-emerald-600" />} title="הגבלות תזונה" />

    <div className="flex flex-wrap gap-1.5">
      {DIETARY_OPTIONS.map((option) => {
        const selected = dietaryType.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onDietaryToggle(option)}
            className={getDietaryOptionClassName(selected)}
          >
            {selected ? <FaCheck size={9} /> : <FaXmark size={9} className="opacity-30" />}
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  </div>
);
