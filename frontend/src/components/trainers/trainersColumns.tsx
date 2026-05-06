import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import DateUtils from "@/lib/dateUtils";
import { PaginatedTrainerRow } from "@/interfaces/trainers";
import { TrainerAvatar } from "./TrainerAvatar";
import { TrainerPlanBadge } from "./TrainerPlanBadge";
import { TrainerStatusBadge } from "./TrainerStatusBadge";
import { TrainerUtilization } from "./TrainerUtilization";

const formatJoinDate = (value?: string) => {
  if (!value) return "-";
  return DateUtils.formatDate(value, "DD/MM/YYYY");
};

export const trainersColumns: ColumnDef<PaginatedTrainerRow>[] = [
  {
    accessorKey: "fullName",
    header: "שם",
    cell: ({ row }) => (
      <div dir="rtl" className="flex w-full items-center  gap-3 text-right ">
        <TrainerAvatar fullName={row.original.fullName} />

        <div className="text-right">
          <div className="font-medium ">{row.original.fullName}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "מספר טלפון",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.phone || "-"}</span>
    ),
  },
  {
    accessorKey: "subscriptionPlan",
    header: "תוכנית",
    cell: ({ row }) => <TrainerPlanBadge plan={row.original.subscriptionPlan} />,
  },
  {
    id: "utilization",
    header: "ניצולת",
    cell: ({ row }) => (
      <TrainerUtilization current={row.original.traineeCount} limit={row.original.clientLimit} />
    ),
  },
  {
    accessorKey: "status",
    header: "סטטוס",
    cell: ({ row }) => <TrainerStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "הצטרף",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatJoinDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "פעולות",
    cell: () => (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-lg border-primary bg-primary/10 h-8  px-4 text-primary hover:bg-primary/20 hover:text-primary font-bold"
      >
        פרטים
      </Button>
    ),
  },
];
