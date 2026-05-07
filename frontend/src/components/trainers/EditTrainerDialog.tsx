import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUpdateTrainer } from "@/hooks/mutations/trainers/useUpdateTrainer";
import {
  TRAINER_STATUSES,
  TRAINER_SUBSCRIPTION_PLANS,
  type TrainerGetOneDTO,
  type TrainerStatus,
} from "@/interfaces/trainers";
import {
  buildUpdateTrainerPayload,
  type UpdateTrainerSchemaType,
  updateTrainerSchema,
} from "@/schemas/trainerSchema";

type EditTrainerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: TrainerGetOneDTO;
};

const statusLabels: Record<TrainerStatus, string> = {
  active: "פעיל",
  inactive: "לא פעיל",
  blocked: "חסום",
};

const summaryCellClassName =
  "flex min-h-[58px] flex-col items-center justify-center px-3 py-2 text-center";

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const percentageTone = (percent: number) => {
  if (percent >= 90) {
    return {
      text: "text-destructive",
      bar: "bg-destructive",
    };
  }

  if (percent >= 75) {
    return {
      text: "text-chart-4",
      bar: "bg-chart-4",
    };
  }

  return {
    text: "text-success",
    bar: "bg-success",
  };
};

export const EditTrainerDialog = ({ open, onOpenChange, data }: EditTrainerDialogProps) => {
  const { trainer, overview } = data;

  const form = useForm<UpdateTrainerSchemaType>({
    resolver: zodResolver(updateTrainerSchema),
    defaultValues: {
      fullName: trainer.fullName,
      email: trainer.email,
      phone: trainer.phone,
      subscriptionPlan: trainer.subscriptionPlan,
      clientLimit: trainer.clientLimit,
      subTrainerLimit: trainer.subTrainerLimit,
      status: trainer.status,
      source: trainer.source,
      videoLibraryAccess: trainer.videoLibraryAccess,
    },
  });

  const updateTrainerMutation = useUpdateTrainer({
    onSuccess: () => {
      toast.success("המאמן עודכן בהצלחה");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("עדכון המאמן נכשל", {
        description: error?.data?.message ?? error?.message,
      });
    },
  });

  useEffect(() => {
    form.reset({
      fullName: trainer.fullName,
      email: trainer.email,
      phone: trainer.phone,
      subscriptionPlan: trainer.subscriptionPlan,
      clientLimit: trainer.clientLimit,
      subTrainerLimit: trainer.subTrainerLimit,
      status: trainer.status,
      source: trainer.source,
      videoLibraryAccess: trainer.videoLibraryAccess,
    });
  }, [form, trainer, open]);

  const currentClients = overview.trainees.current ?? 0;
  const currentSubTrainers = overview.subTrainers.current ?? 0;
  const clientPercent = clampPercent(
    Math.round((currentClients / Math.max(trainer.clientLimit, 1)) * 100)
  );
  const subTrainerPercent = clampPercent(
    Math.round((currentSubTrainers / Math.max(trainer.subTrainerLimit, 1)) * 100)
  );
  const clientTone = percentageTone(clientPercent);
  const subTrainerTone = percentageTone(subTrainerPercent);

  const onSubmit = (values: UpdateTrainerSchemaType) => {
    updateTrainerMutation.mutate({
      id: trainer._id,
      body: buildUpdateTrainerPayload(values),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="grid max-h-[85vh] max-w-[420px] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[18px] p-0 shadow-[0_30px_80px_rgba(15,23,42,0.28)] [&>button]:left-4 [&>button]:right-auto"
      >
        <DialogHeader className="border-b border-primary/40 bg-primary/10 px-5 py-3.5 text-right">
          <DialogTitle className="border-r-4 border-primary ps-4 text-right text-lg font-semibold">
            עריכת מאמן
          </DialogTitle>
          <DialogDescription className="hidden">טופס עריכת מאמן</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
            <div className="min-h-0 space-y-3 overflow-y-auto px-5 py-4">
              <input type="hidden" {...form.register("source")} />

              <div className="overflow-hidden rounded-2xl border border-primary/25 bg-background">
                <div className="grid grid-cols-3 divide-x divide-x-reverse divide-primary/15">
                  <div className={summaryCellClassName}>
                    <div className="text-[11px] leading-none text-muted-foreground">תת-מאמנים</div>
                    <div className="mt-1 flex items-baseline gap-1 text-sm font-semibold text-foreground">
                      <span>{currentSubTrainers}/{trainer.subTrainerLimit}</span>
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
                      <span>{currentClients}/{trainer.clientLimit}</span>
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
                      {trainer.subscriptionPlan}
                    </div>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם מלא</FormLabel>
                    <FormControl>
                      <Input className="border-none bg-muted" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>אימייל</FormLabel>
                    <FormControl>
                      <Input className="border-none bg-muted" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מספר טלפון</FormLabel>
                    <FormControl>
                      <Input dir="ltr" className="border-none bg-muted text-right" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subscriptionPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תוכנית</FormLabel>
                    <Select dir="rtl" onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-none bg-muted">
                          <SelectValue placeholder="בחר תוכנית" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl" className="border-none bg-muted">
                        {TRAINER_SUBSCRIPTION_PLANS.map((plan) => (
                          <SelectItem key={plan} value={plan}>
                            {plan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מגבלת לקוחות</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} className="border-none bg-muted" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subTrainerLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מגבלת תתי-מאמנים</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} className="border-none bg-muted" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>סטטוס</FormLabel>
                    <Select dir="rtl" onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-none bg-muted">
                          <SelectValue placeholder="בחר סטטוס" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl" className="border-none bg-muted">
                        {TRAINER_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="videoLibraryAccess"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border bg-muted px-4 py-3">
                    <div className="space-y-1 text-right">
                      <FormLabel className="block">גישה לספריית תרגילים</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        אפשר למאמן גישה לספריית התרגילים והסרטונים
                      </p>
                    </div>
                    <FormControl>
                      <Switch dir="rtl" checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-3 border-t bg-background px-5 py-4 sm:justify-start sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => onOpenChange(false)}
                disabled={updateTrainerMutation.isPending}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={updateTrainerMutation.isPending}
              >
                {updateTrainerMutation.isPending ? "שומר..." : "שמור שינויים"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
