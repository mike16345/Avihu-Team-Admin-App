import { CardContent } from "@/components/ui/card";
import DateUtils from "@/lib/dateUtils";
import { TrainerGetOneDTO } from "@/interfaces/trainers";
import { cn } from "@/lib/utils";
import { TrainerAvatar } from "./TrainerAvatar";

type TrainerOverviewCardProps = {
  data: TrainerGetOneDTO;
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const getUtilizationTone = (percent: number) => {
  if (percent >= 90) {
    return {
      bar: "bg-destructive",
      text: "text-destructive",
    };
  }

  if (percent >= 75) {
    return {
      bar: "bg-chart-4",
      text: "text-chart-4",
    };
  }

  return {
    bar: "bg-success",
    text: "text-success",
  };
};

export const TrainerOverviewCard = ({ data }: TrainerOverviewCardProps) => {
  const { trainer, overview } = data;
  const currentTrainees = overview.trainees.current ?? 0;
  const safeClientLimit = trainer.clientLimit > 0 ? trainer.clientLimit : 1;
  const percent = clampPercent(Math.round((currentTrainees / safeClientLimit) * 100));
  const tone = getUtilizationTone(percent);

  const metrics = [
    { label: "ניצולת", value: `(${percent}%) ${currentTrainees}/${trainer.clientLimit} ` },
    { label: "לקוחות", value: currentTrainees },
    { label: "מגבלה", value: trainer.clientLimit },
    { label: "תוכנית", value: trainer.subscriptionPlan },
  ];

  return (
    <div dir="rtl" className="rounded-2xl border border-muted bg-card shadow-lg">
      <CardContent className="space-y-6 p-7">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-right">
            <TrainerAvatar fullName={trainer.fullName} className="h-16 w-16 text-2xl font-bold" />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {trainer.fullName}
              </h1>
              <p className="text-sm text-muted-foreground">
                הצטרף:{" "}
                {trainer.createdAt ? DateUtils.formatDate(trainer.createdAt, "DD/MM/YYYY") : "-"}
              </p>
            </div>
          </div>

          <div className="w-full space-y-2 lg:w-auto">
            <div className="grid gap-4 sm:grid-cols-2 lg:w-[400px] lg:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="space-y-1 text-right">
                  <div className="text-sm text-muted-foreground font-bold">{metric.label}</div>
                  <div className={cn("text-xl font-bold tracking-tight", "text-foreground")}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", tone.bar)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
};
