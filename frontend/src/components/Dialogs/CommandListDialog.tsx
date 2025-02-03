import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Option } from "@/types/types";

interface CommandListDialogProps {
  handleChange: (value: string) => void;
  trigger: React.ReactNode;
  items: Option[];
  title?: string;
}

const CommandListDialog: React.FC<CommandListDialogProps> = ({
  handleChange,
  title,
  items,
  trigger,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <DialogTrigger className="w-full" onClick={() => setOpen(true)}>
        {trigger}
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle dir="rtl" className="text-center underline">
            {title}
          </DialogTitle>
          <DialogDescription className="w-full flex justify-center  z-50 "></DialogDescription>
        </DialogHeader>
        <Command>
          <CommandEmpty></CommandEmpty>
          <CommandInput dir="rtl" placeholder="חפש..." />
          <CommandList>
            <CommandGroup dir="rtl">
              {items?.map((option, i) => (
                <CommandItem
                  key={option.name + i}
                  className="text-lg hover:cursor-pointer font-bold border-b-2"
                  value={option.name}
                  onSelect={(_) => {
                    handleChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default CommandListDialog;
