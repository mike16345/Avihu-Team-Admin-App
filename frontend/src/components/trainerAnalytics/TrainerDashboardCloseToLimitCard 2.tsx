import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrainerAvatar } from "@/components/trainers/TrainerAvatar";
import { MainRoutes } from "@/enums/Routes";
import { useGetTrainerDashboardCloseToLimit } from "@/hooks/queries/analytics/useGetTrainerDashboardCloseToLimit";
import { cn } from "@/lib/utils";
import { getUtilizationTone } from "./trainerAnalyticsUtils";

const cardClassName =
  "rounded-[28px] border border-border/60 bg-card p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] w-full md:w-1/2";

export const TrainerDashboardCloseToLimitCard = () => {
  const { data, isLoading, isError, error } = useGetTrainerDashboardCloseToLimit();

  return (
    <section className={cardClassName} dir="rtl">
      <div className="mb-5 flex items-center gap-2">
        <div className="h-8 w-1 rounded-full bg-primary" />
        <h2 className="text-lg font-semibold text-foreground">מאמנים שקרובים למגבלה</h2>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[minmax(0,1fr)_220px] items-center gap-4">
              <Skeleton className="h-3 w-full rounded-full" />
              <div className="flex items-center justify-end gap-3">
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError || !data ? (
        <div className="flex h-40 items-center justify-center text-sm text-destructive">
          {error?.message ?? "שגיאה בטעינת נתוני המגבלה"}
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-[20px] bg-muted/20 text-sm text-muted-foreground">
          אין מאמנים קרובים למגבלה כרגע
        </div>
      ) : (
        <div className="space-y-5">
          {data.map((trainer) => {
            const tone = getUtilizationTone(trainer.utilizationPercentage);

            return (
              <div
                key={trainer._id}
                className="grid items-center gap-4 lg:grid-cols-[250px_minmax(0,1fr)]"
              >
                <Link
                  to={`${MainRoutes.TRAINERS}/${trainer._id}`}
                  className="flex items-center justify-start gap-3 rounded-2xl px-2 py-1 transition-colors hover:bg-muted/40"
                >
                  <TrainerAvatar fullName={trainer.fullName} />

                  <div className="space-y-1 text-right">
                    <div className="font-medium text-foreground">{trainer.fullName}</div>
                    <div className="text-xs text-muted-foreground">{trainer.email}</div>
                  </div>
                </Link>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className={cn("font-semibold", tone.text)}>
                      {trainer.traineeCount}/{trainer.clientLimit}
                    </span>
                    <span className="text-muted-foreground">{trainer.utilizationPercentage}%</span>
                  </div>
                  <Progress
                    value={trainer.utilizationPercentage}
                    className="h-2 bg-muted"
                    indicatorClassName={tone.bar}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
