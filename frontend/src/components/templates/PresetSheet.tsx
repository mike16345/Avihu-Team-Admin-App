import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ExerciseForm from "@/components/forms/ExerciseForm";
import MusceGroupForm from "@/components/forms/MusceGroupForm";
import MenuItemForm from "../forms/MenuItemForm";

interface PresetSheetProps {
  form?: string;
  id?: string;
  isOpen: boolean;
  onCloseSheet: () => void;
}

const PresetSheet: React.FC<PresetSheetProps> = ({ form, id, isOpen, onCloseSheet }) => {
  return (
    <Sheet open={isOpen} onOpenChange={() => onCloseSheet()}>
      <SheetContent dir="rtl">
        <SheetHeader>
          <SheetTitle className="text-right text-3xl pt-4">הוסף פריט</SheetTitle>
          <SheetDescription className="pt-3 text-right">
            כאן ניתן להוסיף פריטים לרשימה הקיימת במערכת
          </SheetDescription>
          {form == `Exercise` && <ExerciseForm objectId={id} closeSheet={() => onCloseSheet()} />}
          {form == `muscleGroup` && (
            <MusceGroupForm objectId={id} closeSheet={() => onCloseSheet()} />
          )}
          {(form == `fats` || form == `vegetables` || form == `carbs` || form == `protein`) && (
            <MenuItemForm objectId={id} closeSheet={() => onCloseSheet()} foodGroup={form} />
          )}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default PresetSheet;
