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
  close: () => void;
  submit: (value: string) => void;
  title?: string;
  description?: string;
}

const InputModal: React.FC<InputModalProps> = ({ close, open, submit, title, description }) => {
  const [value, setValue] = useState<string | null>(null);

  const handleSave = () => {
    if (!value) return;

    submit(value);
    close();
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center pb-2">{title || `בחר שם לתבנית`}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Input value={value || ``} onChange={(e) => setValue(e.target.value)} />
        <DialogFooter className="flex me-auto pt-2 gap-3">
          <Button variant={"secondary"} onClick={close}>
            בטל
          </Button>
          <Button variant={"success"} onClick={handleSave}>
            שמור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InputModal;
