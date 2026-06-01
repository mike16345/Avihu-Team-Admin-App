import { useDeferredValue, useMemo, useState } from "react";
import { CreateTrainerDialog } from "@/components/trainers/CreateTrainerDialog";
import { TrainersTable } from "@/components/trainers/TrainersTable";
import { TrainersToolbar } from "@/components/trainers/TrainersToolbar";
import { usePaginatedTrainersQuery } from "@/hooks/queries/trainers/usePaginatedTrainersQuery";
import { useUrlPagination } from "@/hooks/useUrlPagination";
import { PaginatedTrainerRow } from "@/interfaces/trainers";
import ErrorPage from "@/pages/ErrorPage";

const normalizeValue = (value?: string) => value?.trim().toLowerCase() ?? "";

const statusAliases: Record<string, string[]> = {
  active: ["active", "פעיל"],
  blocked: ["blocked", "חסום"],
  inactive: ["inactive", "לא פעיל"],
};

const planAliases: Record<string, string[]> = {
  pro: ["pro"],
  basic: ["basic", "בסיסי"],
};

const matchesSearch = (trainer: PaginatedTrainerRow, query: string) => {
  const normalizedQuery = normalizeValue(query);
  if (!normalizedQuery) return true;

  return [trainer.fullName, trainer.email, trainer.phone].some((value) =>
    normalizeValue(value).includes(normalizedQuery)
  );
};

const matchesStatus = (trainer: PaginatedTrainerRow, statusFilter: string) => {
  if (statusFilter === "all") return true;
  const normalizedStatus = normalizeValue(trainer.status);
  return (statusAliases[statusFilter] ?? [statusFilter]).some(
    (value) => normalizeValue(value) === normalizedStatus
  );
};

const matchesPlan = (trainer: PaginatedTrainerRow, planFilter: string) => {
  if (planFilter === "all") return true;
  const normalizedPlan = normalizeValue(trainer.subscriptionPlan);
  return (planAliases[planFilter] ?? [planFilter]).some(
    (value) => normalizeValue(value) === normalizedPlan
  );
};

const TrainersPage = () => {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [isCreateTrainerOpen, setIsCreateTrainerOpen] = useState(false);

  const deferredSearchValue = useDeferredValue(searchValue);
  const hasActiveFilters =
    Boolean(searchValue.trim()) || statusFilter !== "all" || planFilter !== "all";

  const { page, pageSize, setPage } = useUrlPagination({
    namespace: "trainers",
    defaultPage: 1,
    defaultPageSize: 10,
  });

  const { data, isLoading, isError, error } = usePaginatedTrainersQuery({
    page,
    limit: pageSize,
  });

  const trainers = data?.results ?? [];
  const pageCount = data?.totalPages ?? 1;

  const filteredTrainers = useMemo(() => {
    return trainers.filter(
      (trainer) =>
        matchesSearch(trainer, deferredSearchValue) &&
        matchesStatus(trainer, statusFilter) &&
        matchesPlan(trainer, planFilter)
    );
  }, [deferredSearchValue, planFilter, statusFilter, trainers]);

  if (isError) {
    return <ErrorPage message={error?.message ?? "שגיאה בטעינת המאמנים"} />;
  }

  return (
    <div dir="rtl" className="space-y-6 px-1 pb-6">
      <div className="space-y-1 text-right">
        <h1 className="text-3xl font-bold tracking-tight ">מאמנים</h1>
        <p className="text-sm text-muted-foreground">ניהול ומעקב אחר כל המאמנים בפלטפורמה</p>
      </div>

      <TrainersToolbar
        searchValue={searchValue}
        statusFilter={statusFilter}
        planFilter={planFilter}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchValue}
        onStatusFilterChange={setStatusFilter}
        onPlanFilterChange={setPlanFilter}
        onResetFilters={() => {
          setSearchValue("");
          setStatusFilter("all");
          setPlanFilter("all");
        }}
        onAddTrainer={() => setIsCreateTrainerOpen(true)}
      />

      <TrainersTable
        data={filteredTrainers}
        isLoading={isLoading}
        page={page}
        pageCount={pageCount}
        onPageChange={(nextPage) => setPage(Math.min(Math.max(nextPage, 1), pageCount))}
      />

      <CreateTrainerDialog
        open={isCreateTrainerOpen}
        onOpenChange={setIsCreateTrainerOpen}
      />
    </div>
  );
};

export default TrainersPage;
