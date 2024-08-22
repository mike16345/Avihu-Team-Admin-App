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
  optionsEndpoint?: string;
  handleChange: (value: any) => void;
  existingValue?: string;
  getOptions: (endpoint?: string) => Promise<any[]>;
}

const ComboBox: React.FC<ComboBoxProps> = ({
  optionsEndpoint,
  getOptions,
  handleChange,
  existingValue,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | undefined>(existingValue);
  const [values, setValues] = useState<any[]>();

  const onChange = (val: string) => {
    if (!values) return;

    setValue(val);
    setOpen(false);
    let objToReturn;

    if (values[0].name) {
      objToReturn = values?.find((obj) => obj.name.toLowerCase() === val.toLowerCase());
    }

    handleChange(objToReturn);
  };

  useEffect(() => {
    if (optionsEndpoint) {
      getOptions(optionsEndpoint)
        .then((res) => setValues(res))
        .catch((err) => console.log(err));
    } else {
      getOptions()
        .then((res) => setValues(res))
        .catch((err) => console.log(err));
    }
  }, [optionsEndpoint]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="max-w-fit flex justify-between" dir="rtl" asChild>
        <Button variant="outline" role="combobox" aria-expanded={open}>
          {value || `בחר`}
          <ChevronsUpDown className="mr-4 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput dir="rtl" placeholder="בחר סוג תוכנית..." />
          <CommandList>
            <CommandGroup dir="rtl">
              {values?.map((option, i) => (
                <CommandItem key={i} value={option.name} onSelect={(val) => onChange(val)}>
                  {option.name}
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
