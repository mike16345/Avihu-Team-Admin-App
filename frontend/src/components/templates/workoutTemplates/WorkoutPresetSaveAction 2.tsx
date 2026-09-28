import { FaCheck } from "react-icons/fa6";

type WorkoutPresetSaveActionProps = {
  isSaving: boolean;
};

function SavingIcon() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WorkoutPresetSaveAction({ isSaving }: WorkoutPresetSaveActionProps) {
  return (
    <div className="sm:sticky sm:bottom-0 -mx-1 mt-2 flex justify-end gap-2 rounded-xl bg-gradient-to-t from-white via-white to-transparent py-2">
      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
      >
        {isSaving && (
          <>
            <SavingIcon />
            שומר…
          </>
        )}
        {!isSaving && (
          <>
            <FaCheck size={12} />
            שמור תבנית
          </>
        )}
      </button>
    </div>
  );
}
