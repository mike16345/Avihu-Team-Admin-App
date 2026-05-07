import { useState } from "react";
import { toast } from "sonner";
import { SubTrainerDialog } from "@/components/subTrainers/SubTrainerDialog";
import { SubTrainersTableCard } from "@/components/subTrainers/SubTrainersTableCard";
import { useDeleteSubTrainer } from "@/hooks/mutations/subTrainers/useDeleteSubTrainer";
import { usePaginatedSubTrainersQuery } from "@/hooks/queries/subTrainers/usePaginatedSubTrainersQuery";
import { useUrlPagination } from "@/hooks/useUrlPagination";
import { PaginatedSubTrainerRow } from "@/interfaces/trainers";
import ErrorPage from "@/pages/ErrorPage";

const SubTrainersPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSubTrainer, setSelectedSubTrainer] = useState<PaginatedSubTrainerRow | null>(null);

  const { page, pageSize, setPage } = useUrlPagination({
    namespace: "sub-trainers",
    defaultPage: 1,
    defaultPageSize: 5,
  });

  const { data, isLoading, isError, error } = usePaginatedSubTrainersQuery({
    page,
    limit: pageSize,
  });

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

  if (isError) {
    return <ErrorPage message={error?.message ?? "שגיאה בטעינת תת-המאמנים"} />;
  }

  const subTrainers = data?.results ?? [];
  const pageCount = data?.totalPages ?? 1;
  const totalCount = data?.totalResults ?? 0;

  return (
    <div dir="rtl" className="space-y-6 px-1 pb-6">
      <div className="space-y-1 text-right">
        <h1 className="text-3xl font-bold tracking-tight">ניהול מאמנים</h1>
        <p className="text-sm text-muted-foreground">
          נהל את צוות המאמנים שלך והרשאות גישה
        </p>
      </div>

      <SubTrainersTableCard
        data={subTrainers}
        isLoading={isLoading}
        page={page}
        pageCount={pageCount}
        totalCount={totalCount}
        onPageChange={(nextPage) => setPage(Math.min(Math.max(nextPage, 1), pageCount))}
        onAddSubTrainer={() => {
          setSelectedSubTrainer(null);
          setIsDialogOpen(true);
        }}
        onEditSubTrainer={(subTrainer) => {
          setSelectedSubTrainer(subTrainer);
          setIsDialogOpen(true);
        }}
        onDeleteSubTrainer={(subTrainer) => deleteSubTrainerMutation.mutate(subTrainer._id)}
        deletingId={
          deleteSubTrainerMutation.isPending ? deleteSubTrainerMutation.variables : undefined
        }
      />

      <SubTrainerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        subTrainer={selectedSubTrainer}
      />
    </div>
  );
};

export default SubTrainersPage;
