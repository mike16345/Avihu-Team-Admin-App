import React, { ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface IDeleteModalProps {
  child: ReactElement<any, any>;
  onClick: any;
}

const DeleteModal: React.FC<IDeleteModalProps> = ({ child, onClick }) => {
  return (
    <Dialog>
      <DialogTrigger className="  ">{child}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle dir="ltr" className="text-right pr-5">
            ...לפני שמתקדמים
          </DialogTitle>
          <DialogDescription dir="rtl" className="text-right py-2 pr-5">
            פעולה זו אינה ניתנת לביטול.<br></br> פעולה זו תמחק את המוצר לצמיתות ותסיר את נתוניו
            מהשרתים שלנו.<br></br>האם אתה בטוח שאתה רוצה להמשיך?
          </DialogDescription>
          <DialogFooter className="w-full flex items-end gap-4">
            <DialogClose>
              <p className="underline text-md cursor-pointer hover:text-blue-500">לא, תודה</p>
            </DialogClose>
            <DialogClose>
              <Button onClick={onClick} variant="destructive">
                כן, המשך
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
