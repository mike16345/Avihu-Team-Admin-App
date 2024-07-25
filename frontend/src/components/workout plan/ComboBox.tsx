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
  getOptions: (endpoint?: string) => Promise<unknown>
}

const ComboBox: React.FC<ComboBoxProps> = ({ optionsEndpoint, getOptions, handleChange, existingValue }) => {

  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string | undefined>(existingValue ? existingValue : undefined);
  const [values, setValues] = useState<any[]>()

  const onChange = (val: string) => {
    setValue(val);
    setOpen(false);
    let objToReturn;
    if (values[0].itemName) {
      objToReturn = values?.find(obj => obj.itemName === val)
    } else {
      console.log(`log`);

      objToReturn = values?.find(obj => obj.presetName === val)
    }
    console.log(values[0])
    console.log(objToReturn);

    handleChange(objToReturn);
  };

  useEffect(() => {
    if (optionsEndpoint) {
      getOptions(optionsEndpoint)
        .then(res => setValues(res))
        .catch(err => console.log(err))
    } else {
      getOptions()
        .then(res => setValues(res))
        .catch(err => console.log(err))
    }

  }, [optionsEndpoint])

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
              {values?.map((option, i) => (
                <CommandItem key={i} value={option.itemName || option.presetName} onSelect={(val) => onChange(val)}>
                  {option.itemName || option.presetName}
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
