import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ProgressNoteForm from "./ProgressNoteForm";
import { useProgressNoteContext } from "@/context/useProgressNoteContext";

const ProgressSheet = () => {
  const { handleCloseProgressSheet, openProgressSheet } = useProgressNoteContext();

  return (
    <Sheet open={openProgressSheet} onOpenChange={handleCloseProgressSheet}>
      <SheetContent dir="rtl" className="hide-scrollbar overflow-y-auto space-y-2">
        <SheetHeader>
          <SheetTitle className="text-right text-3xl">פתק מעקב</SheetTitle>
          <SheetDescription className="text-right">
            טופס זה מאפשר לך לשמור הערות התקדמות אישיות לצורך מעקב וניהול.
          </SheetDescription>
        </SheetHeader>

        <ProgressNoteForm />
      </SheetContent>
    </Sheet>
  );
};

export default ProgressSheet;
