import { cn } from "@/lib/utils";

type TrainerStatusBadgeProps = {
  status: string;
};

const normalizeStatus = (status: string) => status.trim().toLowerCase();

const statusLabels: Record<string, string> = {
  active: "פעיל",
  inactive: "לא פעיל",
  blocked: "חסום",
};

export const TrainerStatusBadge = ({ status }: TrainerStatusBadgeProps) => {
  const normalizedStatus = normalizeStatus(status);
  const label = statusLabels[normalizedStatus] ?? status;

  const className =
    normalizedStatus === "active" || normalizedStatus === "פעיל"
      ? "text-success"
      : normalizedStatus === "blocked" || normalizedStatus === "חסום"
        ? "text-destructive"
        : "text-muted-foreground";

  return <span className={cn("text-sm font-semibold", className)}>{label}</span>;
};
