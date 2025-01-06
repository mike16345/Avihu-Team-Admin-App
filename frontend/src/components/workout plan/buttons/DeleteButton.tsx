import React, { MouseEventHandler, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { BsFillTrash3Fill } from "react-icons/bs";
import { BsTrash3 } from "react-icons/bs";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  tip: string;
  onClick: (e: any) => void;
  disabled?: boolean;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ tip, onClick, disabled = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger className="flex items-center justify-center">
          <Button
            variant={"ghost"}
            disabled={disabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => onClick(e)}
            className={`flex rounded items-center justify-center size-full p-3   hover:bg-accent ${
              disabled && "opacity-30"
            }`}
          >
            {isHovered ? <BsFillTrash3Fill /> : <BsTrash3 />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DeleteButton;
