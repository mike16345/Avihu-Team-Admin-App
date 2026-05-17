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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateTrainer } from "@/hooks/mutations/trainers/useCreateTrainer";
import { TRAINER_SOURCES, TRAINER_SUBSCRIPTION_PLANS } from "@/interfaces/trainers";
import { cn } from "@/lib/utils";
import {
  buildCreateTrainerPayload,
  trainerSchema,
  type TrainerSchemaType,
} from "@/schemas/trainerSchema";

type CreateTrainerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const sourceButtonClassName = (selected: boolean) =>
  cn(
    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
    selected
      ? "border-primary bg-primary/10 text-primary"
      : "border-border text-muted-foreground hover:bg-muted"
  );

export const CreateTrainerDialog = ({ open, onOpenChange }: CreateTrainerDialogProps) => {
  const form = useForm<TrainerSchemaType>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      subscriptionPlan: "Pro",
      clientLimit: 1,
      subTrainerLimit: 1,
      status: "active",
      source: "פנייה קרה",
      videoLibraryAccess: true,
    },
  });

  const createTrainerMutation = useCreateTrainer({
    onSuccess: () => {
      toast.success("המאמן נוצר בהצלחה");
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("יצירת המאמן נכשלה", {
        description: error?.data?.message ?? error?.message,
      });
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [form, open]);

  const onSubmit = (values: TrainerSchemaType) => {
    createTrainerMutation.mutate(buildCreateTrainerPayload(values));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="grid max-w-[430px] max-h-[85vh]  grid-rows-[auto_minmax(0,1fr)]   gap-0 overflow-hidden rounded-[18px] p-0 shadow-[0_30px_80px_rgba(15,23,42,0.28)] [&>button]:left-4 [&>button]:right-auto"
      >
        <DialogHeader className="border-b border-primary/40 bg-primary/10 px-6 py-4 text-right">
          <DialogTitle className="border-r-4 border-primary ps-4 text-right text-lg font-semibold">
            הוספת מאמן חדש
          </DialogTitle>
          <DialogDescription className="hidden">טופס יצירת מאמן חדש</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=" flex min-h-0 flex-col ">
            <div className=" space-y-4 px-5 py-5 overflow-auto">
              <input type="hidden" {...form.register("status")} />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם מלא</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="יש למלא שם מלא"
                        className="border-none bg-muted"
                        {...field}
                      />
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
                      <Input
                        placeholder="יש למלא כתובת אימייל"
                        className="border-none bg-muted"
                        {...field}
                      />
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
                      <Input
                        dir="ltr"
                        className="border-none bg-muted text-right"
                        placeholder="הכנס מספר טלפון"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>סיסמה</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="יש למלא סיסמה"
                        className="border-none bg-muted"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                <FormItem>
                  <FormLabel>סטטוס</FormLabel>
                  <Input
                    value="פעיל"
                    disabled
                    className="border-none bg-muted text-muted-foreground"
                  />
                </FormItem>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="clientLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>מגבלת לקוחות</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          className="border-none bg-muted"
                          placeholder="הזן מגבלת לקוחות"
                          {...field}
                        />
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
                      <FormLabel>מגבלת תתי מאמנים</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          className="border-none bg-muted"
                          placeholder="הזן מגבלת תתי מאמנים"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מקור הגעה</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap justify-start gap-2">
                        {TRAINER_SOURCES.map((source) => (
                          <button
                            key={source}
                            type="button"
                            className={sourceButtonClassName(field.value === source)}
                            onClick={() => field.onChange(source)}
                          >
                            {source}
                          </button>
                        ))}
                      </div>
                    </FormControl>
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
                        האם לאפשר למאמן גישה לספריית התרגילים והסרטונים
                      </p>
                    </div>
                    <FormControl>
                      <Switch dir="rtl" checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex-row gap-3 px-5 py-4 sm:justify-start sm:space-x-0 border-t  ">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => onOpenChange(false)}
                disabled={createTrainerMutation.isPending}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={createTrainerMutation.isPending}
              >
                {createTrainerMutation.isPending ? "יוצר..." : "הוסף מאמן"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
