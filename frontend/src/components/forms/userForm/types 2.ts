import type { FormEvent } from "react";

export type UserFormValues = {
  dateFinished: string;
  dietaryType: string[];
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  planType: string;
  remindIn: number;
  subTrainerId: string;
};

export type UserFormErrors = Record<string, string>;

export type UserFormProps = {
  errors: UserFormErrors;
  initials: string;
  isDeletePending: boolean;
  isEdit: boolean;
  isPending: boolean;
  showDeleteConfirm: boolean;
  values: UserFormValues;
  onApplyDatePreset: (days: number) => void;
  onBack: () => void;
  onCancel: () => void;
  onDateFinishedChange: (value: string) => void;
  onDelete: () => void;
  onDietaryToggle: (item: string) => void;
  onEmailChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPlanTypeChange: (value: string) => void;
  onRemindInChange: (value: number) => void;
  onShowDeleteConfirmChange: (value: boolean) => void;
  onSubmit: (ev: FormEvent<HTMLFormElement>) => void;
  onSubTrainerChange: (value: string) => void;
};
