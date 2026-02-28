import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";

interface RangeContainerProps {
  options: any[];
  onChange: (arr: number[]) => void;
}

const RangeContainer: React.FC<RangeContainerProps> = ({ onChange, options }) => {
  const [range, setRange] = useState({ start: 1, end: 5 });

  const handleInputChange = (value: string, key: "start" | "end") => {
    setRange({ ...range, [key]: +value });
  };

  const generateOptions = () => {
    if (Number.isNaN(range.start) || Number.isNaN(range.end)) return;

    const arrLength = range.end - range.start + 1;
    const optionsArray = Array.from({ length: arrLength });
    onChange(optionsArray.map((_, i) => range.start + i));
  };

  useEffect(() => {
    if (!options.length) return;

    const first = options[0];
    const last = options[options.length - 1];

    if (typeof first === "string" || typeof last === "string") return;

    setRange({ start: +first, end: +last });
  }, [options]);

  useEffect(() => {
    generateOptions();

    return () => {
      onChange([]);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 flex-wrap jus">
      <div className="flex items-center gap-2">
        <span>מ -</span>
        <Input
          className="w-[80px] bg-muted"
          type="number"
          min={1}
          value={range.start}
          onChange={(e) => handleInputChange(e.target.value, "start")}
          onBlur={generateOptions}
        />
      </div>
      <div className="flex items-center gap-2">
        <span>עד -</span>
        <Input
          className="w-[80px] bg-muted"
          type="number"
          min={range.start}
          value={range.end}
          onChange={(e) => handleInputChange(e.target.value, "end")}
          onBlur={generateOptions}
        />
      </div>
    </div>
  );
};

export default RangeContainer;
