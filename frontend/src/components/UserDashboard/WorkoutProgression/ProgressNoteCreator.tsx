import { useMemo, useState } from "react";
import { FaNoteSticky, FaXmark } from "react-icons/fa6";

import DatePicker from "@/components/ui/DatePicker";
import CustomSelect from "@/components/ui/CustomSelect";
import { generateExerciseProgressNote } from "@/lib/exerciseProgressNote";

import { ALL_GROUP_LABEL, type FlatExercise } from "./workoutProgressionModel";

type ProgressNoteCreatorProps = {
  flatExercises: FlatExercise[];
  availableGroups: string[];
  userName?: string;
  recordedWorkouts?: any[];
  onClose: () => void;
};

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

const getDefaultStartDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return formatDateInput(date);
};

const getSelectableGroups = (availableGroups: string[]) =>
  availableGroups.filter((group) => group !== ALL_GROUP_LABEL);

const toggleExerciseSelection = (selectedExercises: string[], name: string) => {
  if (selectedExercises.includes(name)) {
    return selectedExercises.filter((selectedName) => selectedName !== name);
  }

  return [...selectedExercises, name];
};

const getSelectedExerciseCount = (selectedByMuscleGroup: Record<string, string[]>) =>
  Object.values(selectedByMuscleGroup).reduce((count, exercises) => count + exercises.length, 0);

const getOptionalDate = (dateValue: string) => {
  if (!dateValue) return undefined;
  return new Date(dateValue);
};

const getNoteText = (manualText: string | null, generatedNote: string) => {
  if (manualText !== null) return manualText;
  return generatedNote;
};

const getExerciseButtonClassName = (selected: boolean) => {
  if (selected) return "border-amber-300 bg-amber-50/60 text-amber-800";
  return "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-800";
};

const getExerciseCheckClassName = (selected: boolean) => {
  if (selected) return "border-amber-500 bg-amber-500 text-white";
  return "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900";
};

const getCopyButtonLabel = (copied: boolean) => {
  if (copied) return "✓ הועתק!";
  return "העתק";
};

export function ProgressNoteCreator({
  flatExercises,
  availableGroups,
  userName,
  recordedWorkouts,
  onClose,
}: ProgressNoteCreatorProps) {
  const selectableGroups = useMemo(() => getSelectableGroups(availableGroups), [availableGroups]);
  const [startDate, setStartDate] = useState(getDefaultStartDate);
  const [endDate, setEndDate] = useState(() => formatDateInput(new Date()));
  const [muscleGroup, setMuscleGroup] = useState<string>(selectableGroups[0] || "");
  const [selectedByMuscleGroup, setSelectedByMuscleGroup] = useState<Record<string, string[]>>({});
  const [manualText, setManualText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const availableExercises = useMemo(
    () => flatExercises.filter((exercise) => exercise.group === muscleGroup),
    [flatExercises, muscleGroup]
  );
  const selectedExercises = selectedByMuscleGroup[muscleGroup] || [];
  const selectedExerciseCount = getSelectedExerciseCount(selectedByMuscleGroup);

  const selectExercise = (name: string) => {
    setSelectedByMuscleGroup((previous) => ({
      ...previous,
      [muscleGroup]: toggleExerciseSelection(previous[muscleGroup] || [], name),
    }));
    setManualText(null);
  };

  const generatedNote = useMemo(() => {
    if (selectedExerciseCount === 0) return "";

    return generateExerciseProgressNote({
      userName,
      selectedByMuscleGroup,
      muscleGroupOrder: selectableGroups,
      dateRange: {
        from: getOptionalDate(startDate),
        to: getOptionalDate(endDate),
      },
      recordedWorkouts,
    });
  }, [
    selectedByMuscleGroup,
    selectedExerciseCount,
    selectableGroups,
    startDate,
    endDate,
    recordedWorkouts,
    userName,
  ]);

  const noteText = getNoteText(manualText, generatedNote);
  const hasSelectedExercises = selectedExerciseCount > 0;
  const hasAvailableExercises = availableExercises.length > 0;

  const regenerate = () => setManualText(null);

  const copyToClipboard = () => {
    if (noteText && navigator.clipboard) {
      navigator.clipboard.writeText(noteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 font-heebo backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-6xl flex-col gap-4 overflow-hidden rounded-3xl bg-white p-4 shadow-2xl dark:bg-slate-900 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-950/40">
              <FaNoteSticky size={16} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                צור פתק התקדמות
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                בחר טווח תאריכים ותרגילים ליצירת פתק אוטומטי
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="self-end rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 sm:self-auto"
            aria-label="סגור"
          >
            <FaXmark size={18} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
          <div className="modal-sets-scroll order-2 flex min-h-0 flex-col gap-4 overflow-y-auto pl-1 lg:order-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                טווח תאריכים
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-[10px] text-slate-400 dark:text-slate-500">מ-</p>
                  <DatePicker
                    selectedDate={new Date(startDate)}
                    onChangeDate={(date) => {
                      setStartDate(formatDateInput(date));
                      setManualText(null);
                    }}
                  />
                </div>
                <div>
                  <p className="mb-1 text-[10px] text-slate-400 dark:text-slate-500">עד</p>
                  <DatePicker
                    selectedDate={new Date(endDate)}
                    onChangeDate={(date) => {
                      setEndDate(formatDateInput(date));
                      setManualText(null);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                קבוצת שרירים
              </label>
              <CustomSelect
                items={selectableGroups.map((group) => ({ name: group, value: group }))}
                selectedValue={muscleGroup}
                onValueChange={setMuscleGroup}
                className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                תרגילים ({availableExercises.length})
              </label>
              <div className="flex flex-col gap-2">
                {!hasAvailableExercises && (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-500">
                    אין תרגילים בקבוצה זו
                  </p>
                )}
                {hasAvailableExercises &&
                  availableExercises.map((exercise) => {
                    const selected = selectedExercises.includes(exercise.name);

                    return (
                      <button
                        key={exercise.name}
                        onClick={() => selectExercise(exercise.name)}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-right text-sm transition-all ${getExerciseButtonClassName(
                          selected
                        )}`}
                      >
                        <span className="font-medium">{exercise.name}</span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${getExerciseCheckClassName(
                            selected
                          )}`}
                        >
                          {selected && "✓"}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="order-1 flex min-h-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5 lg:order-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  הפתק המוצע
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ניתן לערוך את הטקסט ידנית לפני שליחה
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!noteText}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  {getCopyButtonLabel(copied)}
                </button>
                <button
                  onClick={regenerate}
                  disabled={!hasSelectedExercises}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  רענן פתק
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1">
              {!hasSelectedExercises && (
                <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 text-center dark:border-slate-800">
                  <FaNoteSticky size={28} className="text-slate-300" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    בחר תרגילים כדי ליצור פתק התקדמות.
                  </p>
                </div>
              )}
              {hasSelectedExercises && (
                <textarea
                  value={noteText}
                  onChange={(event) => setManualText(event.target.value)}
                  className="h-full min-h-[260px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/30 p-4 text-sm leading-relaxed text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:text-slate-100"
                  dir="rtl"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
