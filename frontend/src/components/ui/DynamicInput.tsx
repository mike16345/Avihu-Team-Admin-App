import React, { useEffect, useState } from "react";
import { Input, InputProps } from "./input";

interface DynamicInput extends InputProps {
  defaultValue?: string;
}

const DynamicInput: React.FC<DynamicInput> = ({
  defaultValue = "שאלה",
  value,
  onChange,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string | undefined>(value as string);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(e);
  };

  useEffect(() => {
    setInputValue(value as string);
  }, [value]);

  const displayValue = inputValue || defaultValue;

  return (
    <div className="w-full" onClick={() => setIsFocused(true)}>
      {!isFocused && (
        <p className="font-bold cursor-pointer hover:text-primary transition-all">{displayValue}</p>
      )}
      {isFocused && (
        <Input
          {...props}
          className="bg-muted"
          value={inputValue || ""}
          onChange={handleChange}
          onBlur={() => setIsFocused(false)}
          autoFocus
        />
      )}
    </div>
  );
};

export default DynamicInput;
