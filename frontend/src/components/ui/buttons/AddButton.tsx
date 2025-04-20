import React from "react";
import { Button } from "../button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus } from "lucide-react";

interface AddButtonProps {
  onClick: any;
  tip: string;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, tip }) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger type="button" className="w-full">
          <div
            className=" bg-accent rounded border-t-2  flex justify-center px-1 py-1.5  my-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
          >
            <Button
              type="button"
              className="rounded-full h-5 bg-success hover:bg-success hover:font-bold  text-secondary-foreground"
            >
              <Plus size={14} />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <span>{tip}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AddButton;
