import React, { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { BsFillTrash3Fill } from "react-icons/bs";
import { BsTrash3 } from "react-icons/bs";

interface DeleteButtonProps {
  tip: string;
  onClick: () => void;
  disabled?: boolean;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ tip, onClick, disabled = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger className="flex items-center justify-center">
          <button
            disabled={disabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            className={`flex rounded items-center justify-center w-full h-full  hover:bg-accent ${
              disabled && "opacity-30"
            }`}
          >
            {isHovered ? <BsFillTrash3Fill /> : <BsTrash3 />}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DeleteButton;
