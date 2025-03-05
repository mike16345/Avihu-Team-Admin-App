import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./button";
import { Input } from "./input";

interface InputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title?: string;
  description?: string;
}

const InputModal: React.FC<InputModalProps> = ({ onClose, open, onSubmit, title, description }) => {
  const [value, setValue] = useState<string>("");

  const handleSave = () => {
    if (!value) return;

    onSubmit(value);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center pb-2">{title || `בחר שם לתבנית`}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Input value={value || ``} onChange={(e) => setValue(e.target.value)} />
        <DialogFooter className="flex m-auto pt-2 gap-3">
          <Button variant={"success"} onClick={handleSave} className="px-8">
            שמור
          </Button>
          <Button variant={"secondary"} onClick={onClose} className="px-8">
            בטל
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InputModal;
