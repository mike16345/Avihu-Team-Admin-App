import { Skeleton } from "@/components/ui/skeleton";
import { useGetTrainerDashboardSummary } from "@/hooks/queries/analytics/useGetTrainerDashboardSummary";
import { DashboardMetric } from "@/interfaces/IAnalytics";
import { cn } from "@/lib/utils";
import { getTrendTone } from "./trainerAnalyticsUtils";

type SummaryMetricCardProps = {
  title: string;
  metric: DashboardMetric;
  accentBarClassName: string;
  accentTextClassName: string;
};

const cardClassName =
  "relative overflow-hidden rounded-[24px] border border-border/60 bg-card px-6 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]";

const SummaryMetricCard = ({
  title,
  metric,
  accentBarClassName,
  accentTextClassName,
}: SummaryMetricCardProps) => {
  const trendPrefix = metric.trendCount > 0 ? "+" : "";
  const trendText =
    metric.trendCount === 0 ? "ללא שינוי החודש" : `${trendPrefix}${metric.trendCount} החודש`;

  return (
    <div className={cardClassName}>
      <div className={cn("absolute inset-x-0 bottom-0 h-[3px] rounded-full", accentBarClassName)} />

      <div className="space-y-2 text-right">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-[2rem] font-semibold tracking-tight text-foreground">{metric.total}</p>
        <p
          className={cn(
            "text-sm font-medium",
            metric.trendCount === 0 ? getTrendTone(metric.trendCount) : accentTextClassName
          )}
        >
          {trendText}
        </p>
      </div>
    </div>
  );
};

const SummarySkeleton = () => (
  <div className="grid gap-4 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className={cardClassName}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-10 w-24" />
        <Skeleton className="mt-3 h-4 w-32" />
      </div>
    ))}
  </div>
);

const SummaryError = ({ message }: { message?: string }) => (
  <div
    className={cn(
      cardClassName,
      "flex min-h-[112px] items-center justify-center text-sm text-destructive"
    )}
  >
    {message ?? "שגיאה בטעינת נתוני הדאשבורד"}
  </div>
);

export const TrainerDashboardSummarySection = () => {
  const { data, isLoading, isError, error } = useGetTrainerDashboardSummary();

  if (isLoading) {
    return <SummarySkeleton />;
  }

  if (isError || !data) {
    return <SummaryError message={error?.message} />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SummaryMetricCard
        title="מאמנים פעילים"
        metric={data.activeTrainers}
        accentBarClassName="bg-primary"
        accentTextClassName="text-primary"
      />
      <SummaryMetricCard
        title="מצטרפים החודש"
        metric={data.joinedThisMonth}
        accentBarClassName="bg-success"
        accentTextClassName="text-success"
      />
      <SummaryMetricCard
        title="משתמשים באפליקציה"
        metric={data.appUsers}
        accentBarClassName="bg-chart-4"
        accentTextClassName="text-chart-4"
      />
    </div>
  );
};
