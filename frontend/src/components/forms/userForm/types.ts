import type { FormEvent } from "react";

export type UserFormValues = {
  dateStarted: string;
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
export type UserOnChangeCallback = <Key extends keyof UserFormValues>(
  key: Key,
  value: UserFormValues[Key]
) => void;

export type UserFormProps = {
  errors: UserFormErrors;
  initials: string;
  isDeletePending: boolean;
  isEdit: boolean;
  isPending: boolean;
  showDeleteConfirm: boolean;
  values: UserFormValues;
  onChange: UserOnChangeCallback;
  onApplyDatePreset: (days: number) => void;
  onBack: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onDateStartedChange: (value: string) => void;

  onDietaryToggle: (item: string) => void;
  onShowDeleteConfirmChange: (value: boolean) => void;
  onSubmit: (ev: FormEvent<HTMLFormElement>) => void;
};
