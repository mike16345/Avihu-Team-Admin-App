import { addDays } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import FilterMultiSelect from "@/components/tables/FilterMultiSelect";
import { Button } from "@/components/ui/button";
import DateRangePicker from "@/components/ui/DateRangePicker";
import ClipboardIconButton from "@/components/ui/buttons/ClipboardIconButton";
import { Textarea } from "@/components/ui/textarea";
import { IMuscleGroupRecordedSets } from "@/interfaces/IWorkout";
import { generateExerciseProgressNote } from "@/lib/exerciseProgressNote";
import useWorkoutPlanQuery from "@/hooks/queries/workoutPlans/useWorkoutPlanQuery";
import { MuscleGroupCombobox } from "./MuscleGroupCombobox";

interface ExerciseProgressNotePanelProps {
  recordedWorkouts?: IMuscleGroupRecordedSets[];
  userName?: string;
  userId?: string;
}

const ExerciseProgressNotePanel = ({
  recordedWorkouts,
  userName,
  userId,
}: ExerciseProgressNotePanelProps) => {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedByMuscleGroup, setSelectedByMuscleGroup] = useState<Record<string, string[]>>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { data: workoutPlanResponse } = useWorkoutPlanQuery(userId || "");
  const workoutPlan = workoutPlanResponse?.data;

  const muscleGroupOrder = useMemo(() => {
    const ordered: string[] = [];

    workoutPlan?.workoutPlans?.forEach((plan) => {
      plan.muscleGroups?.forEach((group) => {
        if (!ordered.includes(group.muscleGroup)) {
          ordered.push(group.muscleGroup);
        }
      });
    });

    return ordered;
  }, [workoutPlan]);

  const exerciseOptions = useMemo(() => {
    if (!selectedMuscleGroup || !workoutPlan?.workoutPlans) return [];

    const seen = new Set<string>();
    const ordered: { value: string; name: string }[] = [];

    workoutPlan.workoutPlans.forEach((plan) => {
      plan.muscleGroups
        ?.filter((group) => group.muscleGroup === selectedMuscleGroup)
        .forEach((group) => {
          group.exercises?.forEach((exercise) => {
            const details = exercise.exerciseId as { name: string };
            if (!details || seen.has(details.name)) return;

            seen.add(details.name);
            ordered.push({ name: details.name, value: details.name });
          });
        });
    });

    return ordered;
  }, [selectedMuscleGroup, workoutPlan]);

  const selectedExercisesForGroup = selectedMuscleGroup
    ? selectedByMuscleGroup[selectedMuscleGroup] ?? []
    : [];

  const orderSelectionsByPlan = (values: string[]) => {
    const orderMap = exerciseOptions.reduce<Record<string, number>>((acc, option, index) => {
      acc[option.value] = index;
      return acc;
    }, {});

    return [...values].sort(
      (a, b) => (orderMap[a] ?? Number.MAX_SAFE_INTEGER) - (orderMap[b] ?? Number.MAX_SAFE_INTEGER)
    );
  };

  const handleExercisesChange = (values: string[]) => {
    if (!selectedMuscleGroup) return;

    const orderedSelections = orderSelectionsByPlan(values);
    setSelectedByMuscleGroup((prev) => ({
      ...prev,
      [selectedMuscleGroup]: orderedSelections,
    }));
  };

  const handleRemoveExercise = (muscleGroup: string, exercise: string) => {
    setSelectedByMuscleGroup((prev) => {
      const updated = (prev[muscleGroup] || []).filter((item) => item !== exercise);

      if (!updated.length) {
        const { [muscleGroup]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [muscleGroup]: updated };
    });
  };

  const selectedGroupsOrder =
    muscleGroupOrder.length > 0 ? muscleGroupOrder : Object.keys(selectedByMuscleGroup);

  const generatedNote = useMemo(() => {
    const newNote = generateExerciseProgressNote({
      userName,
      selectedByMuscleGroup,
      muscleGroupOrder,
      dateRange,
      recordedWorkouts,
    });

    return newNote;
  }, [userName, selectedByMuscleGroup, muscleGroupOrder, dateRange, recordedWorkouts]);

  const totalSelectedExercises = useMemo(
    () => Object.values(selectedByMuscleGroup).reduce((count, items) => count + items.length, 0),
    [selectedByMuscleGroup]
  );

  const [noteText, setNoteText] = useState(generatedNote);

  const lastGeneratedRef = useRef(generatedNote);

  const hasSelection = totalSelectedExercises > 0;
  const isEdited = noteText !== lastGeneratedRef.current;

  const handleCopy = async () => {
    if (!noteText.trim()) {
      toast.error("אין טקסט להעתקה.");
      return;
    }

    try {
      await navigator.clipboard.writeText(noteText);
      toast.success("הטקסט הועתק ללוח");
    } catch (error) {
      console.error("Failed to copy note:", error);
      toast.error("לא הצלחנו להעתיק ללוח");
    }
  };

  const handleRegenerate = () => {
    setNoteText(generatedNote);
    lastGeneratedRef.current = generatedNote;
  };

  useEffect(() => {
    if (selectedMuscleGroup || !muscleGroupOrder.length) return;
    setSelectedMuscleGroup(muscleGroupOrder[0]);
  }, [muscleGroupOrder, selectedMuscleGroup]);

  useEffect(() => {
    if (noteText === lastGeneratedRef.current) {
      setNoteText(generatedNote);
    }
    lastGeneratedRef.current = generatedNote;
  }, [generatedNote, noteText]);

  return (
    <section className="w-full rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="lg:w-2/5 flex flex-col gap-4 border-b lg:border-b-0 lg:border-l lg:pl-4 lg:pb-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-right">
              <h2 className="text-lg font-semibold">פתק התקדמות בתרגילים</h2>
              <p className="text-sm text-muted-foreground">בחר טווח תאריכים ותרגילים ליצירת פתק</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 text-right">
              <span className="text-sm font-medium">טווח תאריכים</span>
              <DateRangePicker
                selectedRange={dateRange}
                onChangeRange={setDateRange}
                className="w-full justify-between"
              />
            </div>
            <div className="flex flex-col gap-2 text-right">
              <span className="text-sm font-medium">קבוצת שרירים</span>
              <MuscleGroupCombobox
                selectedMuscleGroup={selectedMuscleGroup}
                muscleGroups={muscleGroupOrder}
                handleSelectMuscleGroup={setSelectedMuscleGroup}
              />
            </div>
            <div className="flex flex-col gap-2 text-right">
              <span className="text-sm font-medium">תרגילים</span>
              <FilterMultiSelect
                label="תרגילים"
                options={exerciseOptions}
                selected={selectedExercisesForGroup}
                onChange={handleExercisesChange}
                placeholder="בחר תרגילים"
                className="w-full justify-between"
              />
            </div>
            <div className="flex flex-col gap-2 text-right">
              <span className="text-sm font-medium">תרגילים שנבחרו</span>
              <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-2">
                {!hasSelection && <p className="text-muted-foreground">לא נבחרו תרגילים.</p>}
                {selectedGroupsOrder
                  .filter((muscleGroup) => (selectedByMuscleGroup[muscleGroup] || []).length)
                  .map((muscleGroup) => (
                    <div key={muscleGroup} className="space-y-1">
                      <p className="font-semibold">{muscleGroup}</p>
                      <ul className="space-y-1">
                        {(selectedByMuscleGroup[muscleGroup] || []).map((exercise) => (
                          <li key={exercise} className="flex items-center justify-between gap-2">
                            <span className="truncate">{exercise}</span>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => handleRemoveExercise(muscleGroup, exercise)}
                              aria-label={`הסר את ${exercise} מקבוצת ${muscleGroup}`}
                            >
                              ✕
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:w-3/5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-right">
              <h3 className="text-base font-semibold">הפתק המוצע</h3>
              <p className="text-xs text-muted-foreground">
                ניתן לערוך את הטקסט ידנית לפני שליחה למתאמן
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={!hasSelection || !generatedNote}
              >
                רענן פתק
              </Button>
              <ClipboardIconButton onClick={handleCopy} disabled={!noteText.trim()} />
            </div>
          </div>

          {isEdited && hasSelection && (
            <p className="text-xs text-muted-foreground text-right">
              שינויים ידניים ימחקו בעת רענון.
            </p>
          )}
          {!hasSelection && (
            <div className="flex min-h-[350px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
              בחר תרגילים כדי ליצור פתק התקדמות.
            </div>
          )}
          {hasSelection && (
            <Textarea
              dir="rtl"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="הטקסט שנוצר יופיע כאן"
              className="min-h-[350px] max-h-full resize-none text-right leading-6"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default ExerciseProgressNotePanel;
