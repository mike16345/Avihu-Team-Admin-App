import React, { useState } from "react";
import CardioExercise from "./CardioExercise";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { FaChevronDown, FaChevronUp, FaPlus, FaTrash } from "react-icons/fa6";
import { useFieldArray } from "react-hook-form";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";

interface CardioWeekWrapperProps {
  parentPath: `cardio.plan.weeks.${number}`;
  onDeleteWeek: () => void;
  weekName: string;
}

const getToggleButtonClassName = (isOpen: boolean) => {
  if (isOpen) return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
  return "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800";
};

const getToggleAriaLabel = (isOpen: boolean) => {
  if (isOpen) return "סגור";
  return "פתח";
};

const getNextOpenWorkout = (isOpen: boolean, workoutId: string) => {
  if (isOpen) return null;
  return workoutId;
};

const getToggleIcon = (isOpen: boolean) => {
  if (isOpen) return FaChevronUp;
  return FaChevronDown;
};

const CardioWeekWrapper: React.FC<CardioWeekWrapperProps> = ({
  parentPath,
  onDeleteWeek,
  weekName,
}) => {
  const {
    fields: workouts,
    append,
    remove,
  } = useFieldArray<WorkoutSchemaType, `${typeof parentPath}.workouts`>({
    name: `${parentPath}.workouts`,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [openWorkout, setOpenWorkout] = useState<string | null>(null);
  const WeekToggleIcon = getToggleIcon(isOpen);

  const addExercise = () => {
    const previous = workouts[workouts.length - 1] as unknown as
      | {
          cardioExercise?: string;
          distance?: string;
          warmUpAmount?: number;
          tips?: string;
        }
      | undefined;
    append({
      ...(previous || {}),
      name: `אימון ${workouts.length + 1}`,
    } as any);
  };

  const removeExercise = (index: number) => {
    if (workouts.length === 1) {
      toast.error(`שבוע חייב לכלול לפחות אימון אחד.`);
      return;
    }
    remove(index);
  };

  return (
    <Collapsible
      dir="rtl"
      open={isOpen}
      onOpenChange={setIsOpen}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-heebo shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
        <span className="inline-flex items-center rounded-full bg-sky-50 dark:bg-sky-950/40 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-300">
          {weekName}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen((s) => !s)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${getToggleButtonClassName(
              isOpen
            )}`}
            aria-label={getToggleAriaLabel(isOpen)}
          >
            <WeekToggleIcon size={10} />
          </button>
          <button
            type="button"
            onClick={onDeleteWeek}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400"
            aria-label="מחק שבוע"
          >
            <FaTrash size={10} />
          </button>
        </div>
      </div>

      <CollapsibleContent className="space-y-3 p-4">
        {workouts.map((workout, i) => {
          const open = openWorkout === workout.id;
          const WorkoutToggleIcon = getToggleIcon(open);

          return (
            <div
              key={workout.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {(workout as { name?: string }).name}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenWorkout(getNextOpenWorkout(open, workout.id))}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${getToggleButtonClassName(
                      open
                    )}`}
                    aria-label={getToggleAriaLabel(open)}
                  >
                    <WorkoutToggleIcon size={9} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExercise(i)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-600 dark:hover:text-rose-400"
                    aria-label="הסר אימון"
                  >
                    <FaTrash size={9} />
                  </button>
                </div>
              </div>
              {open && <CardioExercise parentPath={`${parentPath}.workouts.${i}`} />}
            </div>
          );
        })}

        <button
          type="button"
          onClick={addExercise}
          className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <FaPlus size={10} />
          הוסף אימון
        </button>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CardioWeekWrapper;
