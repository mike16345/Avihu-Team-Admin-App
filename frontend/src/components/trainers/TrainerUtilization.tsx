import { cn } from "@/lib/utils";

type TrainerUtilizationProps = {
  current: number;
  limit: number;
};

const clampPercent = (value: number) => {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
};

export const TrainerUtilization = ({ current, limit }: TrainerUtilizationProps) => {
  const safeLimit = limit > 0 ? limit : 0;
  const percent = safeLimit ? clampPercent(Math.round((current / safeLimit) * 100)) : 0;

  const colorClassName =
    percent >= 90 ? "bg-destructive" : percent >= 75 ? "bg-[#F4C430]" : "bg-success";
  const textColorClassName =
    percent >= 90 ? "text-destructive" : percent >= 75 ? "text-[#D97706]" : "text-success";

  return (
    <div className="min-w-[112px] space-y-1  flex items-center gap-2">
      <div className="flex flex-col gap-2 items-end justify-between  font-medium leading-none">
        <span className="text-md">
          {current ?? 0}/{safeLimit}
        </span>
        <span className={cn(textColorClassName) + " text-sm!"}>{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", colorClassName)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
