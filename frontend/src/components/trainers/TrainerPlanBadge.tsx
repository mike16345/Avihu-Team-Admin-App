import { Badge } from "@/components/ui/badge";

type TrainerPlanBadgeProps = {
  plan: string;
};

const normalizePlan = (plan: string) => plan.trim().toLowerCase();

export const TrainerPlanBadge = ({ plan }: TrainerPlanBadgeProps) => {
  const normalizedPlan = normalizePlan(plan);

  const className =
    normalizedPlan === "pro"
      ? "rounded-md border border-primary/20 bg-primary/10 px-3 text-primary"
      : normalizedPlan !== "basic" && normalizedPlan !== "בסיסי"
        ? "rounded-md border border-primary/20 bg-primary/10 px-3 text-primary"
        : "rounded-md border border-secondary bg-secondary px-3 text-secondary-foreground";

  return <Badge className={className}>{plan}</Badge>;
};
