import React from "react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AddButtonProps {
  onClick: any;
  tip: string;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, tip }) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger className="w-full">
          <div
            className=" bg-accent rounded border-t-2  flex justify-center px-1 py-1.5  my-2 cursor-pointer"
            onClick={onClick}
          >
            <Button className="text-sm rounded-full h-5 bg-success hover:bg-success hover:font-bold  text-secondary-foreground">
              +
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AddButton;
