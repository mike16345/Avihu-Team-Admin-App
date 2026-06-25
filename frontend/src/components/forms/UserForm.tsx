import { FaArrowRight, FaUser } from "react-icons/fa6";
import { ActionBar, DeleteConfirmDialog } from "./userForm/actions";
import {
  DietaryRestrictionsSection,
  PersonalDetailsSection,
  PlanAndCoachingSection,
} from "./userForm/sections";
import type { UserFormErrors, UserFormProps, UserFormValues } from "./userForm/types";

export type { UserFormErrors, UserFormValues };

const getBackLabel = (isEdit: boolean) => (isEdit ? "חזרה" : "חזרה למתאמנים");

const getFormModeLabel = (isEdit: boolean) => (isEdit ? "עריכת מתאמן" : "מתאמן חדש");

const getDisplayName = (firstName: string, lastName: string) => {
  const displayName = `${firstName} ${lastName}`.trim();

  return displayName || "ללא שם";
};

const UserForm = ({
  errors,
  initials,
  isDeletePending,
  isEdit,
  isPending,
  showDeleteConfirm,
  values,
  onApplyDatePreset,
  onBack,
  onCancel,
  onDateFinishedChange,
  onDateStartedChange,
  onDelete,
  onDietaryToggle,
  onEmailChange,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onPlanTypeChange,
  onRemindInChange,
  onShowDeleteConfirmChange,
  onSubmit,
  onSubTrainerChange,
}: UserFormProps) => {
  return (
    <div
      data-testid="user-form-page"
      dir="rtl"
      // Bleed across the route container's padding (App.tsx uses
      // px-20 py-14 on the main content column) so the slate
      // background covers the full visible main area — sidebar
      // stays untouched. The form card inside still centers via
      // mx-auto relative to this main area.
      className="-mx-20 -my-14 min-h-screen bg-slate-100/70 dark:bg-slate-950/60 font-heebo"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-2.5 px-4 py-6">
        <BackButton isEdit={isEdit} onBack={onBack} />

        <div className="relative rounded-2xl bg-gradient-to-bl from-blue-100/70 via-white to-indigo-100/70 dark:from-blue-950/40 dark:via-slate-900 dark:to-indigo-950/40 p-[1px] shadow-lg shadow-blue-500/10">
          <div className="rounded-[15px] bg-white dark:bg-slate-900">
            <UserFormHeader
              firstName={values.firstName}
              initials={initials}
              isEdit={isEdit}
              lastName={values.lastName}
            />

            <form onSubmit={onSubmit} className="flex flex-col" data-testid="user-form">
              <PersonalDetailsSection
                email={values.email}
                errors={errors}
                firstName={values.firstName}
                lastName={values.lastName}
                phone={values.phone}
                onEmailChange={onEmailChange}
                onFirstNameChange={onFirstNameChange}
                onLastNameChange={onLastNameChange}
                onPhoneChange={onPhoneChange}
              />

              <PlanAndCoachingSection
                dateFinished={values.dateFinished}
                dateStarted={values.dateStarted}
                errors={errors}
                planType={values.planType}
                remindIn={values.remindIn}
                subTrainerId={values.subTrainerId}
                onApplyDatePreset={onApplyDatePreset}
                onDateFinishedChange={onDateFinishedChange}
                onDateStartedChange={onDateStartedChange}
                onPlanTypeChange={onPlanTypeChange}
                onRemindInChange={onRemindInChange}
                onSubTrainerChange={onSubTrainerChange}
              />

              <DietaryRestrictionsSection
                dietaryType={values.dietaryType}
                onDietaryToggle={onDietaryToggle}
              />

              <ActionBar
                isDeletePending={isDeletePending}
                isEdit={isEdit}
                isPending={isPending}
                onCancel={onCancel}
                onShowDeleteConfirm={() => onShowDeleteConfirmChange(true)}
              />
            </form>
          </div>
        </div>

        {showDeleteConfirm && (
          <DeleteConfirmDialog
            firstName={values.firstName}
            isPending={isDeletePending}
            lastName={values.lastName}
            onClose={() => onShowDeleteConfirmChange(false)}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
};

const BackButton = ({ isEdit, onBack }: { isEdit: boolean; onBack: () => void }) => (
  <button
    onClick={onBack}
    className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600"
  >
    <FaArrowRight size={10} />
    <span>{getBackLabel(isEdit)}</span>
  </button>
);

const UserFormHeader = ({
  firstName,
  initials,
  isEdit,
  lastName,
}: {
  firstName: string;
  initials: string;
  isEdit: boolean;
  lastName: string;
}) => (
  <div className="relative flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full brand-gradient text-sm font-bold text-white shadow-sm shadow-blue-500/30">
      {initials || <FaUser size={12} />}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400">
        {getFormModeLabel(isEdit)}
      </p>
      <h2 className="truncate text-sm font-bold leading-tight text-slate-900 dark:text-slate-100">
        {getDisplayName(firstName, lastName)}
      </h2>
    </div>
  </div>
);

export default UserForm;
