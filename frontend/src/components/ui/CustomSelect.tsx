import React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Option } from "@/types/types";

interface CustomSelectProps {
  placeholder?: string;
  selectedValue?: any;
  items: Option[];
  onValueChange: (value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  items,
  placeholder,
  selectedValue,
  onValueChange,
}) => {
  return (
    <Select value={selectedValue} onValueChange={onValueChange} dir="rtl">
      <SelectTrigger>
        <SelectValue placeholder={selectedValue || placeholder || "בחר"} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map(({ name, value }, i) => (
            <SelectItem className="hover:bg-muted cursor-pointer" key={i} value={value}>
              {name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
