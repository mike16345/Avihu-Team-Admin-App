import { FaPlus } from "react-icons/fa";
import { Card, CardContent } from "../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { FC, useState } from "react";

interface IAddWorkoutPlanProps {
  onClick: () => void;
}

export const AddWorkoutPlanCard: FC<IAddWorkoutPlanProps> = ({ onClick }) => {
  const [isTooltipOpen, setIsToolTipOpen] = useState(false);

  return (
    <Card
      onMouseOver={() => setIsToolTipOpen(true)}
      onMouseLeave={() => setIsToolTipOpen(false)}
      onClick={onClick}
      className=" size-full bg-muted cursor-pointer"
    >
      <CardContent className="size-full flex items-center justify-center ">
        <TooltipProvider delayDuration={100}>
          <Tooltip open={isTooltipOpen} onOpenChange={setIsToolTipOpen}>
            <TooltipTrigger type="button">
              <FaPlus size={20} />
            </TooltipTrigger>
            <TooltipContent>הוסף תרגיל</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
