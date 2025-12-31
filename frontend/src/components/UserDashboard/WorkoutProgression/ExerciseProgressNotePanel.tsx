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
import { extractExercises } from "@/lib/workoutUtils";

interface ExerciseProgressNotePanelProps {
  recordedWorkouts?: IMuscleGroupRecordedSets[];
  userName?: string;
}

const ExerciseProgressNotePanel = ({ recordedWorkouts, userName }: ExerciseProgressNotePanelProps) => {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const exerciseOptions = useMemo(() => {
    const options = new Map<string, string>();

    recordedWorkouts?.forEach((group) => {
      extractExercises(group.recordedSets).forEach((exercise) => {
        options.set(exercise, exercise);
      });
    });

    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
  }, [recordedWorkouts]);

  const generatedNote = useMemo(
    () =>
      generateExerciseProgressNote({
        userName,
        selectedExercises,
        dateRange,
        recordedWorkouts,
      }),
    [userName, selectedExercises, dateRange, recordedWorkouts]
  );

  const lastGeneratedRef = useRef(generatedNote);
  const [noteText, setNoteText] = useState(generatedNote);

  useEffect(() => {
    if (noteText === lastGeneratedRef.current) {
      setNoteText(generatedNote);
    }
    lastGeneratedRef.current = generatedNote;
  }, [generatedNote, noteText]);

  const hasSelection = selectedExercises.length > 0;
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

  return (
    <section className="w-full rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-stretch">
        <div className="lg:w-2/5 flex flex-col gap-4 border-b pb-4 lg:border-b-0 lg:border-l lg:pl-4 lg:pb-0">
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
              <span className="text-sm font-medium">תרגילים</span>
              <FilterMultiSelect
                label="תרגילים"
                options={exerciseOptions}
                selected={selectedExercises}
                onChange={setSelectedExercises}
                placeholder="בחר תרגילים"
                className="w-full justify-between"
              />
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
            <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
              בחר תרגילים כדי ליצור פתק התקדמות.
            </div>
          )}
          {hasSelection && (
            <Textarea
              dir="rtl"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="הטקסט שנוצר יופיע כאן"
              className="min-h-[220px] resize-none text-right leading-6"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default ExerciseProgressNotePanel;
