import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  VisibilityState,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";
import { Input } from "@/components/ui/input";
import { FilterIcon } from "lucide-react";
import { RowData } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import DeleteButton from "../ui/buttons/DeleteButton";
import UserExpiredTooltip from "./UserExpiredTooltip";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  actionButton?: ReactNode;
  filters?: ReactNode;
  handleViewData: (data: TData) => void;
  handleSetData: (data: TData) => void;
  handleDeleteData: (data: TData) => void;
  handleViewNestedData: (data: any | any[], id: string) => void;
  getRowClassName: (row: TData) => string;
  handleHoverOnRow: (row: TData) => boolean;
}

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    handleViewData: (data: TData) => void;
    handleSetData: (data: TData) => void;
    handleDeleteData: (data: TData) => void;
    handleViewNestedData: (data: any | any[], id: string) => void;
    getRowClassName: (row: TData) => string;
    handleHoverOnRow: (row: TData) => boolean;
  }
}

export function DataTableHebrew<TData, TValue>({
  columns,
  data,
  actionButton,
  filters,
  handleViewData,
  handleDeleteData,
  handleViewNestedData,
  handleSetData,
  getRowClassName,
  handleHoverOnRow,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const { pageNumber, goToPage } = usePagination();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    meta: {
      handleViewData: (data: TData) => handleViewData(data),
      handleDeleteData: (data: TData) => handleDeleteData(data),
      handleViewNestedData: (data: TData, id: string) => handleViewNestedData(data, id),
      handleSetData: (data: TData) => handleSetData(data),
      getRowClassName: (data: TData) => getRowClassName(data),
      handleHoverOnRow: (data: TData) => handleHoverOnRow(data),
    },

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: pageNumber - 1,
      },
    },
  });

  const handleDeleteRows = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    selectedRows.forEach(async (row) => await handleDeleteData(row.original));
    setRowSelection({});
  };

  return (
    <div className="space-y-4 rounded-xl bg-background/80 p-4 shadow-sm">
      <div className="flex flex-col gap-4  pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Input
            placeholder="חיפוש..."
            value={(table.getColumn("שם")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("שם")?.setFilterValue(event.target.value)}
            className="h-9 sm:w-72"
          />

          <div className="block text-center text-sm text-muted-foreground sm:hidden">
            {table.getFilteredSelectedRowModel().rows.length} {"תוך "}
            {table.getFilteredRowModel().rows.length} שורות נבחרו.
          </div>

          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground sm:w-auto sm:justify-end sm:text-right">
            <div>
              דף {pageNumber} תוך {table.getPageCount()}
            </div>
            {Object.keys(rowSelection).length > 0 && (
              <div className="hidden sm:block">
                {table.getFilteredSelectedRowModel().rows.length} {"תוך "}
                {table.getFilteredRowModel().rows.length} שורות נבחרו.
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {Object.keys(rowSelection).length > 0 && (
              <DeleteButton onClick={handleDeleteRows} tip="הסר משתמשים" />
            )}
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 px-3">
                  סינון עמודות
                  <FilterIcon size={15} className="mr-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        onSelect={(e) => e.preventDefault()}
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.columnDef.header instanceof Function
                          ? column.id
                          : column.columnDef.header}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            {actionButton}
          </div>
        </div>

        {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
      </div>
      <div className="rounded-md border min-h-[60vh] max-h-[65vh] overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="text-right" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <UserExpiredTooltip isActive={handleHoverOnRow?.(row.original)}>
                  <TableRow
                    key={row.id}
                    className={getRowClassName(row.original)}
                    onDoubleClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.id == "row-checkbox" || target.id == "access-switch") return;

                      handleViewData(row.original);
                    }}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                </UserExpiredTooltip>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  אין תוצאות
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-3 py-4">
        <Button
          variant="outline"
          onClick={() => {
            table.previousPage();
            goToPage(pageNumber - 1);
          }}
          disabled={!table.getCanPreviousPage()}
        >
          קודם
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            table.nextPage();
            goToPage(pageNumber + 1);
          }}
          disabled={!table.getCanNextPage()}
        >
          הבא
        </Button>
      </div>
    </div>
  );
}
