import { Progress } from "@/components/ui/progress";

type SummaryTone = {
  text: string;
  bar: string;
};

type TrainerEditSummaryCardProps = {
  currentClients: number;
  clientLimit: number;
  clientPercent: number;
  clientTone: SummaryTone;
  currentSubTrainers: number;
  subTrainerLimit: number;
  subTrainerPercent: number;
  subTrainerTone: SummaryTone;
  subscriptionPlan: string;
};

const summaryCellClassName =
  "flex min-h-[58px] flex-col items-center justify-center px-3 py-2 text-center";

export const TrainerEditSummaryCard = ({
  currentClients,
  clientLimit,
  clientPercent,
  clientTone,
  currentSubTrainers,
  subTrainerLimit,
  subTrainerPercent,
  subTrainerTone,
  subscriptionPlan,
}: TrainerEditSummaryCardProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-primary/25 bg-background">
      <div className="grid grid-cols-3 divide-x divide-x-reverse divide-primary/15">
        <div className={summaryCellClassName}>
          <div className="text-[11px] leading-none text-muted-foreground">תת-מאמנים</div>
          <div className="mt-1 flex items-baseline gap-1 text-sm font-semibold text-foreground">
            <span>
              {currentSubTrainers}/{subTrainerLimit}
            </span>
            <span className={subTrainerTone.text}>{subTrainerPercent}%</span>
          </div>
          <Progress
            value={subTrainerPercent}
            className="mt-2 h-1.5 w-full bg-muted"
            indicatorClassName={subTrainerTone.bar}
          />
        </div>

        <div className={summaryCellClassName}>
          <div className="text-[11px] leading-none text-muted-foreground">לקוחות</div>
          <div className="mt-1 flex items-baseline gap-1 text-sm font-semibold text-foreground">
            <span>
              {currentClients}/{clientLimit}
            </span>
            <span className={clientTone.text}>{clientPercent}%</span>
          </div>
          <Progress
            value={clientPercent}
            className="mt-2 h-1.5 w-full bg-muted"
            indicatorClassName={clientTone.bar}
          />
        </div>

        <div className={summaryCellClassName}>
          <div className="text-[11px] leading-none text-muted-foreground">תוכנית</div>
          <div className="mt-2 text-2xl font-semibold leading-none text-primary">
            {subscriptionPlan}
          </div>
        </div>
      </div>
    </div>
  );
};
