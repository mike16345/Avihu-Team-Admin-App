import { DataTableHebrew } from "@/components/tables/DataTableHebrew";
import { PaginatedTrainerRow } from "@/interfaces/trainers";
import { trainersColumns } from "./trainersColumns";

type TrainersTableProps = {
  data: PaginatedTrainerRow[];
  isLoading: boolean;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export const TrainersTable = ({
  data,
  isLoading,
  page,
  pageCount,
  onPageChange,
}: TrainersTableProps) => {
  return (
    <div className="overflow-hidden rounded-[28px] border border-default shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <div className="h-1 w-full bg-primary" />
      <DataTableHebrew
        columns={trainersColumns}
        data={data}
        hideToolbar
        isLoadingNextPage={isLoading}
        className="[&_thead]:bg-muted [&_tbody_tr:hover]:bg-accented rounded-none bg-transparent p-0 shadow-none"
        tableWrapperClassName="max-h-none min-h-0 rounded-none border-0"
        paginationClassName="px-6 pb-6 pt-0"
        emptyStateText="לא נמצאו מאמנים"
        getRowId={(row) => row._id}
        handleSetData={() => {}}
        handleViewData={() => {}}
        handleDeleteData={() => {}}
        handleViewNestedData={() => {}}
        getRowClassName={() => ""}
        handleHoverOnRow={() => false}
        pageNumber={page}
        pageCount={pageCount}
        onPageChange={onPageChange}
        paginationKey="trainers"
        testIdPrefix="trainers"
        rowClickMode="single"
      />
    </div>
  );
};
