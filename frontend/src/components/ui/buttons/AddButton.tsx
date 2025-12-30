import React from "react";
import { Button } from "../button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus } from "lucide-react";

interface AddButtonProps {
  onClick: any;
  tip?: string;
  label?: string;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, tip, label }) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger type="button" className="w-full">
          <div
            className="border-2 bg-background rounded-xl border-dashed  border-primary opacity-80 hover:opacity-100 transition-all flex justify-center px-1 py-1.5  my-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
          >
            <div className="flex items-center gap-5">
              <Plus className="text-primary " size={20} />
              {!!label && <p className="text-primary font-bold">{label}</p>}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent hidden={!tip}>
          <span>{tip}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AddButton;
