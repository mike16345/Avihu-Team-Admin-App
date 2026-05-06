import { Badge } from "@/components/ui/badge";

type TrainerPlanBadgeProps = {
  plan: string;
};

const normalizePlan = (plan: string) => plan.trim().toLowerCase();

export const TrainerPlanBadge = ({ plan }: TrainerPlanBadgeProps) => {
  const normalizedPlan = normalizePlan(plan);

  const className =
    normalizedPlan === "pro"
      ? "rounded-md  bg-primary/10 text-primary px-5"
      : normalizedPlan !== "basic" && normalizedPlan !== "בסיסי"
        ? "rounded-md px-5  bg-primary/10 text-primary"
        : "rounded-md px-5  bg-slate-100 text-slate-700";

  return <Badge className={`${className} hover:bg-muted`}>{plan}</Badge>;
};
