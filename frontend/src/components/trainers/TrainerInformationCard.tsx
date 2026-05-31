import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrainerGetOneDTO } from "@/interfaces/trainers";
import DateUtils from "@/lib/dateUtils";
import { CalendarDays, Clock3, Gem, Mail, Phone, Radio, SquareActivity, Users } from "lucide-react";
import { ReactNode } from "react";
import { TrainerPlanBadge } from "./TrainerPlanBadge";
import { TrainerStatusBadge } from "./TrainerStatusBadge";

type DetailRowProps = {
  label: string;
  icon: ReactNode;
  value: ReactNode;
};

const DetailRow = ({ label, icon, value }: DetailRowProps) => {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="text-sm text-muted-foreground font-semibold">{label}</div>
      <div className="flex items-center gap-3 text-sm font-medium text-foreground">
        <div>{value}</div>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border bg-muted/60 text-muted-foreground">
          {icon}
        </span>
      </div>
    </div>
  );
};

type TrainerInformationCardProps = {
  data: TrainerGetOneDTO;
};

export const TrainerInformationCard = ({ data }: TrainerInformationCardProps) => {
  const { trainer, overview } = data;

  const rows = [
    {
      label: "סטטוס",
      icon: <SquareActivity className="h-3.5 w-3.5" />,
      value: <TrainerStatusBadge status={trainer.status} />,
    },
    {
      label: "תוכנית",
      icon: <Gem className="h-3.5 w-3.5" />,
      value: <TrainerPlanBadge plan={trainer.subscriptionPlan} />,
    },
    {
      label: "מגבלת לקוחות + נוכחיים",
      icon: <Users className="h-3.5 w-3.5" />,
      value: `${overview.trainees.current} / ${trainer.clientLimit}`,
    },
    {
      label: "אימייל",
      icon: <Mail className="h-3.5 w-3.5" />,
      value: trainer.email,
    },
    {
      label: "מספר טלפון",
      icon: <Phone className="h-3.5 w-3.5" />,
      value: trainer.phone,
    },
    {
      label: "מקור הגעה",
      icon: <Radio className="h-3.5 w-3.5" />,
      value: trainer.source,
    },
    {
      label: "תאריך הצטרפות",
      icon: <CalendarDays className="h-3.5 w-3.5" />,
      value: trainer.createdAt ? DateUtils.formatDate(trainer.createdAt, "DD/MM/YYYY") : "-",
    },
    {
      label: "עודכן לאחרונה",
      icon: <Clock3 className="h-3.5 w-3.5" />,
      value: trainer.updatedAt ? DateUtils.formatDate(trainer.updatedAt, "DD/MM/YYYY") : "-",
    },
  ];

  return (
    <div dir="rtl" className="w-full rounded-2xl border border-muted bg-card shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="border-r-4 border-primary pr-3 text-right text-xl">פרטים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {rows.map((row, index) => (
          <div key={row.label}>
            <DetailRow label={row.label} icon={row.icon} value={row.value} />
            {index < rows.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </CardContent>
    </div>
  );
};
