import { FC } from "react";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { RadioGroupProps } from "@radix-ui/react-radio-group";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface IRadioItem<T> {
  id: string;
  value: T;
  label: string;
}

interface CustomRadioGroupProps extends RadioGroupProps {
  items: IRadioItem<string>[];
}

const CustomRadioGroup: FC<CustomRadioGroupProps> = ({ items, className, ...props }) => {
  return (
    <RadioGroup dir="rtl" className={cn(`flex flex-col `, className)} {...props}>
      {items.map((item) => {
        return (
          <div className="flex items-center gap-2 ">
            <RadioGroupItem type="button" value={item.value} id={item.id} />
            <Label htmlFor={item.id}>{item.label}</Label>
          </div>
        );
      })}
    </RadioGroup>
  );
};

export default CustomRadioGroup;
