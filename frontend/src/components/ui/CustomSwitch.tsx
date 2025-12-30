import React from "react";
import { Switch } from "./switch";
import { Label } from "./label";

interface CustomSwitchProps {
  label: string;
  id?: string;
  checked: boolean;
  onCheckedChange: (val: boolean) => void;
  className?: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  checked,
  label,
  onCheckedChange,
  id = "switch",
  className,
}) => {
  return (
    <div className={`flex items-center gap-2  ${className}`}>
      <Switch dir="rtl" id={id} name={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
};

export default CustomSwitch;
