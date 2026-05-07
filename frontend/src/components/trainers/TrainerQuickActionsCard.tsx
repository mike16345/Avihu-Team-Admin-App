import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban, Eye, Pencil } from "lucide-react";
import { ReactNode } from "react";

type ActionButtonProps = {
  icon: ReactNode;
  title: string;
  className: string;
  onClick?: () => void;
};

const ActionButton = ({ icon, title, className, onClick }: ActionButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
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
};

export const TrainerQuickActionsCard = ({ onEdit }: TrainerQuickActionsCardProps) => {
  return (
    <Card
      dir="rtl"
      className="rounded-2xl border-border/50 bg-card shadow-[0_10px_30px_hsl(var(--foreground)/0.05)]"
    >
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
          title="חסום מאמן"
          icon={<Ban className="h-4 w-4" />}
          className="border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive"
        />
        <ActionButton
          title="צפה בתת-מאמנים"
          icon={<Eye className="h-4 w-4" />}
          className="border-chart-5/40 bg-chart-5/10 text-chart-5 hover:bg-chart-5/15 hover:text-chart-5"
        />
      </CardContent>
    </Card>
  );
};
