import { SubTrainerStatus } from "@/interfaces/trainers";
import { cn } from "@/lib/utils";

const statusConfig: Record<SubTrainerStatus, { label: string; className: string }> = {
  active: {
    label: "פעיל",
    className: "bg-success/10 text-success",
  },
  inactive: {
    label: "לא פעיל",
    className: "bg-chart-4/15 text-chart-4",
  },
};

type SubTrainerStatusBadgeProps = {
  status: SubTrainerStatus;
};

export const SubTrainerStatusBadge = ({ status }: SubTrainerStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        config.className
      )}
    >
      {config.label}
    </span>
  );
};
