import { useState } from "react";
import { toast } from "sonner";
import { SubTrainerDialog } from "@/components/subTrainers/SubTrainerDialog";
import { SubTrainersTableCard } from "@/components/subTrainers/SubTrainersTableCard";
import { useDeleteSubTrainer } from "@/hooks/mutations/subTrainers/useDeleteSubTrainer";
import { usePaginatedSubTrainersQuery } from "@/hooks/queries/subTrainers/usePaginatedSubTrainersQuery";
import { useUrlPagination } from "@/hooks/useUrlPagination";
import { PaginatedSubTrainerRow } from "@/interfaces/trainers";
import ErrorPage from "@/pages/ErrorPage";
import { FaUsers } from "react-icons/fa6";

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
    <div
      dir="rtl"
      className="flex flex-col gap-5 px-1 pb-6"
      style={{ fontFamily: "Assistant, Heebo, system-ui, sans-serif" }}
    >
      {/* Hero header — brand-gradient icon, title + subtitle, count badge */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100/60 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
        <div className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-blue-100/60 dark:bg-blue-950/30 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-blue-500/25">
            <FaUsers size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">ניהול מאמנים</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              נהל את צוות המאמנים שלך והרשאות גישה
            </p>
          </div>
          {totalCount > 0 && (
            <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-sm font-bold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
              {totalCount} {totalCount === 1 ? "מאמן" : "מאמנים"}
            </span>
          )}
        </div>
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
