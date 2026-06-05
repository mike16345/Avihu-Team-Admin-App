/**
 * MuscleGroupSelector — pencil-trigger + selection modal for picking a
 * muscle group on a workout-plan card.
 *
 * Visual refresh:
 *  - Trigger: subtle ghost button with a pencil icon — only shows "ערוך" /
 *    "בחר" depending on whether a group exists. The colored pill in the
 *    parent header already shows the current selection.
 *  - Modal: rounded-2xl Heebo card with a search input and a grid of
 *    colored muscle-group pills (palette mirrored from MuscleGroupContainer).
 *
 * Form-state hooks are unchanged.
 */
import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { removePointerEventsFromBody } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { MUSCLE_GROUPS } from "@/constants/muscleGroups";
import { FaPenToSquare, FaPlus, FaMagnifyingGlass } from "react-icons/fa6";

interface MuscleGroupSelectorProps {
  handleDismiss: (value?: string) => void;
  handleChange: (value: string) => void;
  existingMuscleGroup?: string;
  pathToMuscleGroups: `workoutPlans.${number}.muscleGroups`;
}

/** Mirrored from MuscleGroupContainer — same palette across the editor. */
/**
 * Refined palette: white card with a thin colored left-border accent +
 * a small colored dot. Reads as "tag" rather than "highlighter pill",
 * which is what the user asked for.
 */
const MUSCLE_DOTS: Record<string, { dot: string; ring: string; text: string }> = {
  חזה: {
    dot: "bg-rose-500",
    ring: "hover:border-rose-300 dark:hover:border-rose-700",
    text: "group-hover:text-rose-700 dark:group-hover:text-rose-300",
  },
  גב: {
    dot: "bg-emerald-500",
    ring: "hover:border-emerald-300 dark:hover:border-emerald-700",
    text: "group-hover:text-emerald-700 dark:group-hover:text-emerald-300",
  },
  כתפיים: {
    dot: "bg-amber-500",
    ring: "hover:border-amber-300 dark:hover:border-amber-700",
    text: "group-hover:text-amber-700 dark:group-hover:text-amber-300",
  },
  "יד קדמית": {
    dot: "bg-blue-500",
    ring: "hover:border-blue-300 dark:hover:border-blue-700",
    text: "group-hover:text-blue-700 dark:group-hover:text-blue-300",
  },
  "יד אחורית": {
    dot: "bg-indigo-500",
    ring: "hover:border-indigo-300 dark:hover:border-indigo-700",
    text: "group-hover:text-indigo-700 dark:group-hover:text-indigo-300",
  },
  ביצפס: {
    dot: "bg-blue-500",
    ring: "hover:border-blue-300 dark:hover:border-blue-700",
    text: "group-hover:text-blue-700 dark:group-hover:text-blue-300",
  },
  טריצפס: {
    dot: "bg-indigo-500",
    ring: "hover:border-indigo-300 dark:hover:border-indigo-700",
    text: "group-hover:text-indigo-700 dark:group-hover:text-indigo-300",
  },
  רגליים: {
    dot: "bg-violet-500",
    ring: "hover:border-violet-300 dark:hover:border-violet-700",
    text: "group-hover:text-violet-700 dark:group-hover:text-violet-300",
  },
  ישבן: {
    dot: "bg-fuchsia-500",
    ring: "hover:border-fuchsia-300 dark:hover:border-fuchsia-700",
    text: "group-hover:text-fuchsia-700 dark:group-hover:text-fuchsia-300",
  },
  תאומים: {
    dot: "bg-teal-500",
    ring: "hover:border-teal-300 dark:hover:border-teal-700",
    text: "group-hover:text-teal-700 dark:group-hover:text-teal-300",
  },
  טרפזים: {
    dot: "bg-cyan-500",
    ring: "hover:border-cyan-300 dark:hover:border-cyan-700",
    text: "group-hover:text-cyan-700 dark:group-hover:text-cyan-300",
  },
  אמות: {
    dot: "bg-sky-500",
    ring: "hover:border-sky-300 dark:hover:border-sky-700",
    text: "group-hover:text-sky-700 dark:group-hover:text-sky-300",
  },
  בטן: {
    dot: "bg-orange-500",
    ring: "hover:border-orange-300 dark:hover:border-orange-700",
    text: "group-hover:text-orange-700 dark:group-hover:text-orange-300",
  },
};
const dotsFor = (group: string) =>
  MUSCLE_DOTS[group] || {
    dot: "bg-slate-400",
    ring: "hover:border-slate-300 dark:hover:border-slate-700",
    text: "",
  };

const MuscleGroupSelector: React.FC<MuscleGroupSelectorProps> = ({
  handleChange,
  handleDismiss,
  existingMuscleGroup,
  pathToMuscleGroups,
}) => {
  const { getValues } = useFormContext<WorkoutSchemaType>();
  const muscleGroups = getValues(pathToMuscleGroups);

  const [value, setValue] = useState<string>(existingMuscleGroup || "");
  const [open, setOpen] = useState(!Boolean(existingMuscleGroup));
  const [query, setQuery] = useState("");

  const available = useMemo(() => {
    const used = new Set(muscleGroups.map((mg) => mg.muscleGroup));
    return MUSCLE_GROUPS.filter((g) => !used.has(g));
  }, [muscleGroups]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return available;
    return available.filter((g) => g.includes(q));
  }, [available, query]);

  const updateSelection = (selection: string) => {
    handleChange(selection);
    setValue(selection);
    setOpen(false);
    setQuery("");
    removePointerEventsFromBody();
  };

  const hasSelection = Boolean(existingMuscleGroup);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) handleDismiss(value);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/60 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300"
          style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
        >
          {hasSelection ? <FaPenToSquare size={11} /> : <FaPlus size={11} />}
          {hasSelection ? "ערוך" : "בחר קבוצה"}
        </button>
      </DialogTrigger>
      <DialogContent
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="overflow-hidden rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 sm:max-w-md"
        style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
      >
        <DialogHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 sm:text-right">
          <DialogTitle className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">
            בחירת קבוצת שריר
          </DialogTitle>
          <DialogDescription className="text-right text-xs text-slate-500 dark:text-slate-400">
            בחר את הקבוצה שתופיע באימון
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pt-4">
          <div className="relative">
            <FaMagnifyingGlass
              size={12}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              autoFocus
              dir="rtl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש מהיר…"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 py-2 pr-9 pl-3 text-sm text-slate-700 dark:text-slate-200 outline-none transition-colors placeholder:text-slate-400 focus:border-purple-300 focus:bg-white"
            />
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              לא נמצאו קבוצות מתאימות
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filtered.map((group) => {
                const d = dotsFor(group);
                const isSelected = value === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => updateSelection(group)}
                    className={`group flex items-center gap-2.5 rounded-xl border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all ${
                      isSelected
                        ? "border-purple-400 ring-2 ring-purple-200 dark:ring-purple-900/40"
                        : `border-slate-200 dark:border-slate-800 ${d.ring}`
                    } hover:shadow-sm`}
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${d.dot}`} />
                    <span className={`transition-colors ${d.text}`}>{group}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MuscleGroupSelector;
