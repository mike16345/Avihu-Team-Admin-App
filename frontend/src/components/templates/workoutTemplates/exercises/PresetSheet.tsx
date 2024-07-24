import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ExerciseForm from "@/components/forms/ExerciseForm";

interface PresetSheetProps {
  form?: string;
  id?: string;
  isOpen: boolean;
  onCloseSheet: () => void;
}

const PresetSheet: React.FC<PresetSheetProps> = ({ form, id, isOpen, onCloseSheet }) => {
  return (
    <Sheet modal={false} open={isOpen} onOpenChange={() => onCloseSheet()}>
      <SheetContent dir="rtl">
        <SheetHeader>
          <SheetTitle className="text-right text-3xl pt-4">הוסף פריט</SheetTitle>
          <SheetDescription className="pt-3 text-right">
            כאן ניתן להוסיף פריטים לרשימה הקיימת במערכת
          </SheetDescription>
          {form == `Exercise` && <ExerciseForm objectId={id} />}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default PresetSheet;
