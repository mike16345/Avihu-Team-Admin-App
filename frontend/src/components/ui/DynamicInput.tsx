import React, { useState } from "react";
import { Input } from "./input";

interface DynamicInput {
  defaultValue?: string;
}

const DynamicInput: React.FC<DynamicInput> = ({ defaultValue = "שאלה ללא שם" }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState<string>();

  return (
    <div className="w-full" onClick={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
      {!isFocused && (
        <p className="font-bold cursor-pointer hover:text-primary transition-all">
          {value ?? defaultValue}
        </p>
      )}
      {isFocused && (
        <Input
          className="bg-muted"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
};

export default DynamicInput;
