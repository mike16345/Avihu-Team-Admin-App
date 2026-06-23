import { ReactNode } from "react";
import { Ban, Eye, Pencil, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ActionButtonProps = {
  icon: ReactNode;
  title: string;
  className: string;
  onClick?: () => void;
  disabled?: boolean;
};

const ActionButton = ({ icon, title, className, onClick, disabled }: ActionButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={`h-11 w-full justify-between rounded-xl border text-sm font-semibold ${className}`}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-current">
        {icon}
      </div>
      <div className="w-full">{title}</div>
    </Button>
  );
};

type TrainerQuickActionsCardProps = {
  onEdit?: () => void;
  onToggleAccess?: () => void;
  onViewSubTrainers?: () => void;
  isAccessUpdating?: boolean;
  isBlocked?: boolean;
};

export const TrainerQuickActionsCard = ({
  onEdit,
  onToggleAccess,
  onViewSubTrainers,
  isAccessUpdating = false,
  isBlocked = false,
}: TrainerQuickActionsCardProps) => {
  const accessButtonTitle = isBlocked ? "הענק גישה למאמן" : "חסום מאמן";
  const accessButtonIcon = isBlocked ? (
    <ShieldCheck className="h-4 w-4" />
  ) : (
    <Ban className="h-4 w-4" />
  );
  const accessButtonClassName = isBlocked
    ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-300"
    : "border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive";

  return (
    <div dir="rtl" className="rounded-2xl border border-muted bg-card shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="border-r-4 border-primary pr-3 text-right text-xl">
          פעולות מהירות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ActionButton
          title="ערוך מאמן"
          icon={<Pencil className="h-4 w-4" />}
          onClick={onEdit}
          className="border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
        />
        <ActionButton
          title={accessButtonTitle}
          icon={accessButtonIcon}
          onClick={onToggleAccess}
          disabled={isAccessUpdating}
          className={accessButtonClassName}
        />
        <ActionButton
          title="צפה בתתי-מאמנים"
          icon={<Eye className="h-4 w-4" />}
          onClick={onViewSubTrainers}
          className="border-chart-5/40 bg-chart-5/10 text-chart-5 hover:bg-chart-5/15 hover:text-chart-5"
        />
      </CardContent>
    </div>
  );
};
