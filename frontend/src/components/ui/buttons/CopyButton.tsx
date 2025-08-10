import React, { MouseEventHandler, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { PiCopyBold, PiCopyFill } from "react-icons/pi";

interface CopyButtonProps {
  tip: string;
  onClick: (e: any) => void;
  disabled?: boolean;
}

const CopyButton: React.FC<CopyButtonProps> = ({ tip, onClick, disabled = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger type="button" className="flex items-center justify-center">
          <Button
            type="button"
            variant={"ghost"}
            disabled={disabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
              e.preventDefault();
              onClick(e);
            }}
            className={`flex rounded items-center justify-center size-full p-3   hover:bg-accent ${
              disabled && "opacity-30"
            }`}
          >
            {isHovered ? <PiCopyFill /> : <PiCopyBold />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyButton;
