import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ExerciseForm from "@/components/forms/ExerciseForm";
import MuscleGroupForm from "@/components/forms/MuscleGroupForm";
import MenuItemForm from "../forms/MenuItemForm";
import ExerciseMethodsForm from "../forms/ExerciseMethodsForm";
import CardioWorkoutForm from "../forms/cardioWorkoutForm";
import LessonGroupForm from "../forms/LessonGroupForm";

interface PresetSheetProps {
  form?: string;
  id?: string;
  isOpen: boolean;
  onCloseSheet: () => void;
}

const PresetSheet: React.FC<PresetSheetProps> = ({ form, id, isOpen, onCloseSheet }) => {
  const isFoodGroup =
    form == `fats` || form == `vegetables` || form == `carbs` || form == `protein`;

  return (
    <Sheet open={isOpen} onOpenChange={() => onCloseSheet()}>
      <SheetContent className="hide-scrollbar overflow-y-auto space-y-2" dir="rtl">
        <SheetHeader>
          <SheetTitle className="text-right text-3xl">הוסף פריט</SheetTitle>
          <SheetDescription className="text-right">
            כאן ניתן להוסיף פריטים לרשימה הקיימת במערכת
          </SheetDescription>
        </SheetHeader>
        {form == `Exercise` && <ExerciseForm objectId={id} closeSheet={() => onCloseSheet()} />}
        {form == `muscleGroup` && (
          <MuscleGroupForm objectId={id} closeSheet={() => onCloseSheet()} />
        )}
        {form == `cardioWorkouts` && (
          <CardioWorkoutForm objectId={id} closeSheet={() => onCloseSheet()} />
        )}
        {form == `exercisesMethods` && (
          <ExerciseMethodsForm objectId={id} closeSheet={() => onCloseSheet()} />
        )}
        {isFoodGroup && (
          <MenuItemForm objectId={id} closeSheet={() => onCloseSheet()} foodGroup={form} />
        )}
        {form == "lessonGroups" && <LessonGroupForm objectId={id} closeSheet={onCloseSheet} />}
      </SheetContent>
    </Sheet>
  );
};

export default PresetSheet;
