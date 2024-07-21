import React, { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ComboBoxProps {
  options: string[] | undefined;
  handleChange: (value: string) => void;
  existingValue?: string;
}

const ComboBox: React.FC<ComboBoxProps> = ({ options, handleChange, existingValue }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | undefined>(existingValue ? existingValue : undefined);

  const onChange = (val: string) => {
    setValue(val);
    setOpen(false);
    handleChange(val);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger dir="rtl" asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value || `בחר`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput dir="rtl" placeholder="בחר סוג תוכנית..." />
          <CommandList>
            <CommandGroup dir="rtl">
              {options?.map((option) => (
                <CommandItem key={option} value={option} onSelect={(val) => onChange(val)}>
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;
