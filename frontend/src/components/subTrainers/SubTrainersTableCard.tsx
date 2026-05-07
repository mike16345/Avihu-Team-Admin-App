import { useDeferredValue, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/components/ui/Loader";
import { PaginatedSubTrainerRow } from "@/interfaces/trainers";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { TrainerAvatar } from "../trainers/TrainerAvatar";
import { SubTrainerPositionBadge } from "./SubTrainerPositionBadge";
import { SubTrainerStatusBadge } from "./SubTrainerStatusBadge";

type SubTrainersTableCardProps = {
  data: PaginatedSubTrainerRow[];
  isLoading: boolean;
  page: number;
  pageCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onAddSubTrainer?: () => void;
  onEditSubTrainer?: (subTrainer: PaginatedSubTrainerRow) => void;
  onDeleteSubTrainer?: (subTrainer: PaginatedSubTrainerRow) => void;
  deletingId?: string;
  searchPlaceholder?: string;
  addButtonLabel?: string;
  emptyStateText?: string;
  className?: string;
};

const normalizeValue = (value?: string) => value?.trim().toLowerCase() ?? "";

const matchesSearch = (subTrainer: PaginatedSubTrainerRow, query: string) => {
  const normalizedQuery = normalizeValue(query);
  if (!normalizedQuery) return true;

  return [subTrainer.fullName, subTrainer.email].some((value) =>
    normalizeValue(value).includes(normalizedQuery)
  );
};

export const SubTrainersTableCard = ({
  data,
  isLoading,
  page,
  pageCount,
  totalCount,
  onPageChange,
  onAddSubTrainer,
  onEditSubTrainer,
  onDeleteSubTrainer,
  deletingId,
  searchPlaceholder = "חיפוש מאמנים...",
  addButtonLabel = "הוסף מאמן",
  emptyStateText = "לא נמצאו תת-מאמנים",
  className,
}: SubTrainersTableCardProps) => {
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);

  const filteredData = useMemo(() => {
    return data.filter((subTrainer) => matchesSearch(subTrainer, deferredSearchValue));
  }, [data, deferredSearchValue]);

  return (
    <div
      dir="rtl"
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-background shadow-[0_18px_50px_rgba(15,23,42,0.06)]",
        className
      )}
    >
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[320px]">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 rounded-xl border-none bg-muted pr-10 text-right placeholder:text-muted-foreground"
          />
        </div>

        <Button
          type="button"
          onClick={onAddSubTrainer}
          className="rounded-lg px-4 font-bold bg-foreground"
        >
          <Plus className="ml-2 h-4 w-4" />
          {addButtonLabel}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-right">שם מאמן</TableHead>
              <TableHead className="text-right">תפקיד</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-right">לקוחות</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64">
                  <div className="flex h-full items-center justify-center">
                    <Loader size="large" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length ? (
              filteredData.map((subTrainer) => (
                <TableRow key={subTrainer._id}>
                  <TableCell>
                    <div className="flex items-center gap-3 text-right">
                      <TrainerAvatar fullName={subTrainer.fullName} />
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{subTrainer.fullName}</div>
                        <div className="text-xs text-muted-foreground">{subTrainer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <SubTrainerPositionBadge position={subTrainer.position} />
                  </TableCell>
                  <TableCell>
                    <SubTrainerStatusBadge status={subTrainer.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                      <span>{subTrainer.traineeCount} לקוחות</span>
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                        onClick={() => onEditSubTrainer?.(subTrainer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDeleteSubTrainer?.(subTrainer)}
                        disabled={deletingId === subTrainer._id}
                      >
                        {deletingId === subTrainer._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                  {emptyStateText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t px-5 py-4">
        <div className="text-xs text-muted-foreground">סה"כ {totalCount} מאמנים</div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <div className="flex h-7 min-w-7 items-center justify-center rounded-md bg-foreground px-2 text-xs font-medium text-background">
            {page}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
