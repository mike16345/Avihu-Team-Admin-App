import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubTrainerDialog } from "@/components/subTrainers/SubTrainerDialog";
import { SubTrainersTableCard } from "@/components/subTrainers/SubTrainersTableCard";
import { useDeleteSubTrainer } from "@/hooks/mutations/subTrainers/useDeleteSubTrainer";
import { usePaginatedSubTrainersQuery } from "@/hooks/queries/subTrainers/usePaginatedSubTrainersQuery";
import { PaginatedSubTrainerRow } from "@/interfaces/trainers";

type TrainerSubTrainersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainerId: string;
  trainerName: string;
};

export const TrainerSubTrainersDialog = ({
  open,
  onOpenChange,
  trainerId,
  trainerName,
}: TrainerSubTrainersDialogProps) => {
  const [page, setPage] = useState(1);
  const [isSubTrainerDialogOpen, setIsSubTrainerDialogOpen] = useState(false);
  const [selectedSubTrainer, setSelectedSubTrainer] = useState<PaginatedSubTrainerRow | null>(null);

  const { data, isLoading, isError, error } = usePaginatedSubTrainersQuery(
    {
      page,
      limit: 5,
      query: { trainerId },
    },
    open
  );

  const deleteSubTrainerMutation = useDeleteSubTrainer({
    onSuccess: () => {
      toast.success("תת-המאמן הוסר בהצלחה");
    },
    onError: (mutationError: any) => {
      toast.error("מחיקת תת-המאמן נכשלה", {
        description: mutationError?.data?.message ?? mutationError?.message,
      });
    },
  });

  useEffect(() => {
    if (!open) {
      setPage(1);
      setSelectedSubTrainer(null);
      setIsSubTrainerDialogOpen(false);
    }
  }, [open]);

  const subTrainers = data?.results ?? [];
  const pageCount = data?.totalPages ?? 1;
  const totalCount = data?.totalResults ?? 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          dir="rtl"
          className="max-w-[960px] gap-0 overflow-hidden rounded-[18px] p-0 shadow-[0_30px_80px_rgba(15,23,42,0.28)] [&>button]:left-4 [&>button]:right-auto"
        >
          <DialogHeader className="px-6 py-4 text-right">
            <DialogTitle className="text-right text-lg font-semibold">
              תת-מאמנים של {trainerName}
            </DialogTitle>
            <DialogDescription className="hidden">
              רשימת תת-המאמנים של המאמן
            </DialogDescription>
          </DialogHeader>

          <div className="px-4 pb-4">
            <SubTrainersTableCard
              data={subTrainers}
              isLoading={isLoading}
              page={page}
              pageCount={pageCount}
              totalCount={totalCount}
              onPageChange={(nextPage) => setPage(Math.min(Math.max(nextPage, 1), pageCount))}
              onAddSubTrainer={() => {
                setSelectedSubTrainer(null);
                setIsSubTrainerDialogOpen(true);
              }}
              onEditSubTrainer={(subTrainer) => {
                setSelectedSubTrainer(subTrainer);
                setIsSubTrainerDialogOpen(true);
              }}
              onDeleteSubTrainer={(subTrainer) => deleteSubTrainerMutation.mutate(subTrainer._id)}
              deletingId={
                deleteSubTrainerMutation.isPending ? deleteSubTrainerMutation.variables : undefined
              }
              searchPlaceholder="חיפוש תת-מאמנים..."
              emptyStateText={isError ? error?.message ?? "שגיאה בטעינת תת-המאמנים" : "לא נמצאו תת-מאמנים"}
              className="border-0 shadow-none"
            />
          </div>
        </DialogContent>
      </Dialog>

      <SubTrainerDialog
        open={isSubTrainerDialogOpen}
        onOpenChange={setIsSubTrainerDialogOpen}
        subTrainer={selectedSubTrainer}
        trainerIdPreset={trainerId}
        lockTrainerId
      />
    </>
  );
};
