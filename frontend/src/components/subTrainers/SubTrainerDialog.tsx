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
import { useCreateSubTrainer } from "@/hooks/mutations/subTrainers/useCreateSubTrainer";
import { useUpdateSubTrainer } from "@/hooks/mutations/subTrainers/useUpdateSubTrainer";
import { useTrainersQuery } from "@/hooks/queries/trainers/useTrainersQuery";
import { PaginatedSubTrainerRow } from "@/interfaces/trainers";
import {
  buildCreateSubTrainerPayload,
  buildUpdateSubTrainerPayload,
  createSubTrainerSchema,
  type CreateSubTrainerSchemaType,
  SUB_TRAINER_POSITIONS,
  SUB_TRAINER_STATUSES,
  type UpdateSubTrainerSchemaType,
  updateSubTrainerSchema,
} from "@/schemas/subTrainerSchema";
import { useSubTrainerQuery } from "@/hooks/queries/subTrainers/useSubTrainerQuery";
import { usePaginatedSubTrainersQuery } from "@/hooks/queries/subTrainers/usePaginatedSubTrainersQuery";

type SubTrainerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subTrainer?: PaginatedSubTrainerRow | null;
  trainerIdPreset?: string;
  lockTrainerId?: boolean;
};

const statusLabels = {
  active: "פעיל",
  inactive: "לא פעיל",
} as const;

const createDefaultValues = (trainerIdPreset?: string): CreateSubTrainerSchemaType => ({
  fullName: "",
  email: "",
  phone: "",
  password: "",
  position: "מאמן",
  status: "active",
  trainerId: trainerIdPreset ?? "",
});

const updateDefaultValues = (
  subTrainer?: PaginatedSubTrainerRow | null,
  trainerIdPreset?: string
): UpdateSubTrainerSchemaType => ({
  fullName: subTrainer?.fullName ?? "",
  email: subTrainer?.email ?? "",
  phone: subTrainer?.phone ?? "",
  position: subTrainer?.position ?? "מאמן",
  status: subTrainer?.status ?? "active",
  trainerId: subTrainer?.trainerId ?? trainerIdPreset ?? "",
});

export const SubTrainerDialog = ({
  open,
  onOpenChange,
  subTrainer,
  trainerIdPreset,
  lockTrainerId = false,
}: SubTrainerDialogProps) => {
  const isEditMode = Boolean(subTrainer);
  const { data: trainers = [], isLoading: isLoadingTrainers } = useTrainersQuery(open);
  const { data: subTrainers = [] } = usePaginatedSubTrainersQuery();

  const createForm = useForm<CreateSubTrainerSchemaType>({
    resolver: zodResolver(createSubTrainerSchema),
    defaultValues: createDefaultValues(trainerIdPreset),
  });

  const updateForm = useForm<UpdateSubTrainerSchemaType>({
    resolver: zodResolver(updateSubTrainerSchema),
    defaultValues: updateDefaultValues(subTrainer, trainerIdPreset),
  });

  const createSubTrainerMutation = useCreateSubTrainer({
    onSuccess: () => {
      toast.success("תת-המאמן נוצר בהצלחה");
      createForm.reset(createDefaultValues(trainerIdPreset));
      onOpenChange(false);
    },
    onError: (error: any) => {
      const limit = subTrainers.totalResults ?? 0;
      const isLimitReached = error.data.message == "Trainer sub trainer limit reached.";

      const title = isLimitReached
        ? "הגעת למגבלת תת-המאמנים שניתן להוסיף"
        : '"יצירת תת-המאמן נכשלה"';

      const description = isLimitReached
        ? `כרגע ישנם ${limit}/${limit} תת מתאנים פעילים. לשדרג את החבילה פנה לאדמין`
        : (error?.data?.message ?? error?.message);

      toast.error(title, {
        description,
      });
    },
  });

  const updateSubTrainerMutation = useUpdateSubTrainer({
    onSuccess: () => {
      toast.success("תת-המאמן עודכן בהצלחה");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error("עדכון תת-המאמן נכשל", {
        description: error?.data?.message ?? error?.message,
      });
    },
  });

  useEffect(() => {
    if (!open) {
      createForm.reset(createDefaultValues(trainerIdPreset));
      updateForm.reset(updateDefaultValues(subTrainer, trainerIdPreset));
      return;
    }

    if (isEditMode) {
      updateForm.reset(updateDefaultValues(subTrainer, trainerIdPreset));
      return;
    }

    createForm.reset(createDefaultValues(trainerIdPreset));
  }, [createForm, isEditMode, open, subTrainer, trainerIdPreset, updateForm]);

  const form = isEditMode ? updateForm : createForm;
  const isPending = createSubTrainerMutation.isPending || updateSubTrainerMutation.isPending;
  const selectedTrainerId = subTrainer?.trainerId ?? trainerIdPreset;
  const trainerName = trainers.find((trainer) => trainer._id === selectedTrainerId)?.fullName ?? "";

  const handleSubmitCreate = (values: CreateSubTrainerSchemaType) => {
    createSubTrainerMutation.mutate({
      body: buildCreateSubTrainerPayload(values),
      trainerId: trainerIdPreset,
    });
  };

  const handleSubmitUpdate = (values: UpdateSubTrainerSchemaType) => {
    if (!subTrainer) return;

    updateSubTrainerMutation.mutate({
      id: subTrainer._id,
      body: buildUpdateSubTrainerPayload(values),
      trainerId: selectedTrainerId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-w-[430px] gap-0 overflow-hidden rounded-[18px] p-0 shadow-[0_30px_80px_rgba(15,23,42,0.28)] [&>button]:left-4 [&>button]:right-auto"
      >
        <DialogHeader className="px-6 py-4 text-right">
          <DialogTitle className="text-right text-lg font-semibold">
            {isEditMode ? "עריכת מאמן" : "הוספת מאמן חדש"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditMode ? "עדכון פרטי תת-המאמן" : "צור איש צוות מאמן חדש"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(isEditMode ? handleSubmitUpdate : handleSubmitCreate)}
            className="space-y-4 px-6 pb-5"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שם מלא</FormLabel>
                  <FormControl>
                    <Input placeholder="ישי כהן" className="border-none bg-muted" {...field} />
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
                  <FormLabel>שם אימייל</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@email.com"
                      className="border-none bg-muted"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditMode ? (
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>סיסמה</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="הכנס סיסמה חזקה"
                        className="border-none bg-muted"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>מספר טלפון</FormLabel>
                  <FormControl>
                    <Input
                      dir="ltr"
                      placeholder="050-123-4567"
                      className="border-none bg-muted text-right"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תפקיד</FormLabel>
                  <Select dir="rtl" onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-none bg-muted">
                        <SelectValue placeholder="בחר תפקיד" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl" className="border-none bg-muted">
                      {SUB_TRAINER_POSITIONS.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
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
                      {SUB_TRAINER_STATUSES.map((status) => (
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

            {lockTrainerId ? (
              <div className="space-y-2">
                <FormLabel>מאמן ראשי</FormLabel>
                <Input
                  value={trainerName || "מאמן נבחר"}
                  disabled
                  className="border-none bg-muted text-muted-foreground"
                />
                <input type="hidden" {...form.register("trainerId")} />
              </div>
            ) : (
              <FormField
                control={form.control}
                name="trainerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מאמן ראשי</FormLabel>
                    <Select dir="rtl" onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-none bg-muted">
                          <SelectValue
                            placeholder={isLoadingTrainers ? "טוען מאמנים..." : "בחר מאמן ראשי"}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl" className="border-none bg-muted">
                        {trainers.map((trainer) => (
                          <SelectItem key={trainer._id} value={trainer._id}>
                            {trainer.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary">
              מאמן יוכל להעניק את כל כמות האימונים שתאפשר לו
            </div>

            <DialogFooter className="flex-row gap-3 pt-2 sm:justify-start sm:space-x-0">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                className="w-full rounded-xl"
                disabled={isPending || isLoadingTrainers}
              >
                {isPending ? "שומר..." : isEditMode ? "שמור שינויים" : "הוסף מאמן"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
