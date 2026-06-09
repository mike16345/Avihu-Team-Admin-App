/**
 * PresetSheet — centred modal used to add or edit a preset item
 * (exercise, muscle group, cardio workout, exercise method, food
 * group, or lesson group).
 *
 * Despite the legacy "Sheet" name we now render a centred `<Dialog>`
 * — the original side-drawer was distracting on wide screens. Header
 * adapts per form type so the user always sees what they're editing.
 */
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ExerciseForm from "@/components/forms/ExerciseForm";
import MuscleGroupForm from "@/components/forms/MuscleGroupForm";
import MenuItemForm from "../forms/MenuItemForm";
import ExerciseMethodsForm from "../forms/ExerciseMethodsForm";
import CardioWorkoutForm from "../forms/cardioWorkoutForm";
import LessonGroupForm from "../forms/LessonGroupForm";
import {
  FaDumbbell,
  FaUserCheck,
  FaPersonRunning,
  FaSliders,
  FaBowlFood,
  FaBookOpen,
  FaPlus,
} from "react-icons/fa6";

interface PresetSheetProps {
  form?: string;
  id?: string;
  isOpen: boolean;
  onCloseSheet: () => void;
}

const FORM_META: Record<
  string,
  { icon: React.ReactNode; title: (isEdit: boolean) => string; description: string }
> = {
  Exercise: {
    icon: <FaDumbbell size={16} />,
    title: (isEdit) => (isEdit ? "עריכת תרגיל" : "הוספת תרגיל"),
    description: "הוסף תרגיל חדש לספריית התרגילים, כולל סרטון וטיפים",
  },
  muscleGroup: {
    icon: <FaUserCheck size={16} />,
    title: (isEdit) => (isEdit ? "עריכת קבוצת שריר" : "קבוצת שריר חדשה"),
    description: "ניהול קבוצות השריר הזמינות בעת בניית תוכניות אימון",
  },
  cardioWorkouts: {
    icon: <FaPersonRunning size={16} />,
    title: (isEdit) => (isEdit ? "עריכת אימון אירובי" : "אימון אירובי חדש"),
    description: "תרגילי אירובי לרשימת ההתאמות בעת בניית תוכניות אירובי",
  },
  exercisesMethods: {
    icon: <FaSliders size={16} />,
    title: (isEdit) => (isEdit ? "עריכת שיטת אימון" : "שיטת אימון חדשה"),
    description: "שיטות אימון כמו דרופ-סט, פירמידה, סופר-סט וכו'",
  },
  foodGroup: {
    icon: <FaBowlFood size={16} />,
    title: (isEdit) => (isEdit ? "עריכת מאכל" : "מאכל חדש"),
    description: "מאכלים זמינים בעת בניית תפריט תזונה",
  },
  lessonGroups: {
    icon: <FaBookOpen size={16} />,
    title: (isEdit) => (isEdit ? "עריכת קבוצת לימוד" : "קבוצת לימוד חדשה"),
    description: "סדרת מאמרים / שיעורים שיוצגו ביחד באפליקציה",
  },
};

const PresetSheet: React.FC<PresetSheetProps> = ({ form, id, isOpen, onCloseSheet }) => {
  const isFoodGroup =
    form === "fats" || form === "vegetables" || form === "carbs" || form === "protein";

  const metaKey = isFoodGroup ? "foodGroup" : form ?? "";
  const meta = FORM_META[metaKey];
  const isEdit = !!id;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseSheet()}>
      <DialogContent
        dir="rtl"
        className="max-w-xl max-h-[90vh] overflow-hidden p-0 gap-0 rounded-2xl flex flex-col"
        style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
      >
        {/* Branded header */}
        <header className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-bl from-blue-50/60 to-transparent dark:from-blue-950/30 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60">
              {meta ? meta.icon : <FaPlus size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-right text-lg font-bold text-slate-900 dark:text-slate-100">
                {meta ? meta.title(isEdit) : isEdit ? "עריכת פריט" : "הוסף פריט"}
              </h2>
              <p className="mt-0.5 text-right text-xs text-slate-500 dark:text-slate-400">
                {meta
                  ? meta.description
                  : "כאן ניתן להוסיף פריטים לרשימה הקיימת במערכת"}
              </p>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {form === "Exercise" && <ExerciseForm objectId={id} closeSheet={onCloseSheet} />}
          {form === "muscleGroup" && (
            <MuscleGroupForm objectId={id} closeSheet={onCloseSheet} />
          )}
          {form === "cardioWorkouts" && (
            <CardioWorkoutForm objectId={id} closeSheet={onCloseSheet} />
          )}
          {form === "exercisesMethods" && (
            <ExerciseMethodsForm objectId={id} closeSheet={onCloseSheet} />
          )}
          {isFoodGroup && (
            <MenuItemForm objectId={id} closeSheet={onCloseSheet} foodGroup={form} />
          )}
          {form === "lessonGroups" && <LessonGroupForm objectId={id} closeSheet={onCloseSheet} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PresetSheet;
