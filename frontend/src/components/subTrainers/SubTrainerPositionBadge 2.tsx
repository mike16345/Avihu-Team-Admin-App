import { SubTrainerPosition } from "@/interfaces/trainers";
import { cn } from "@/lib/utils";

const positionClassName: Record<SubTrainerPosition, string> = {
  מאמן: "bg-primary/10 text-primary",
  תזונאי: "bg-chart-5/12 text-chart-5",
  "יועץ תזונה": "bg-secondary text-secondary-foreground",
  אחר: "bg-muted text-muted-foreground",
};

type SubTrainerPositionBadgeProps = {
  position: SubTrainerPosition;
};

export const SubTrainerPositionBadge = ({ position }: SubTrainerPositionBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        positionClassName[position]
      )}
    >
      {position}
    </span>
  );
};
