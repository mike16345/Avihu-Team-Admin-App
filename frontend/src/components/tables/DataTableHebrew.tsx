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
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FilterIcon, Trash2Icon } from "lucide-react";
import { RowData } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  actionButton?: React.JSX.Element;
  handleViewData: (data: TData) => void;
  handleSetData: (data: TData) => void;
  handleDeleteData: (data: TData) => void;
  handleViewNestedData: (data: any | any[], id: string) => void;
  getRowClassName: (row: TData) => string;
}

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    handleViewData: (data: TData) => void;
    handleSetData: (data: TData) => void;
    handleDeleteData: (data: TData) => void;
    handleViewNestedData: (data: any | any[], id: string) => void;
    getRowClassName: (row: TData) => string;
  }
}

export function DataTableHebrew<TData, TValue>({
  columns,
  data,
  actionButton,
  handleViewData,
  handleDeleteData,
  handleViewNestedData,
  handleSetData,
  getRowClassName,
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
    <>
      <div className="flex flex-col ">
        <div className="w-full flex flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-center py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <Input
              placeholder="חיפוש..."
              value={(table.getColumn("שם")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("שם")?.setFilterValue(event.target.value)}
              className="sm:max-w-sm"
            />
          </div>
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="">
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
          <div className=" shrink-0 block sm:hidden text-sm text-muted-foreground sm:text-right text-center">
            {table.getFilteredSelectedRowModel().rows.length} {"תוך "}
            {table.getFilteredRowModel().rows.length} שורות נבחרו.
          </div>
        </div>
        <div className="mb-3 text-sm  flex items-center justify-between ">
          <div className="text-muted-foreground">
            דף {pageNumber} תוך {table.getPageCount()}
          </div>
          <div className=" shrink-0 hidden sm:block text-sm text-muted-foreground sm:text-right text-center">
            {table.getFilteredSelectedRowModel().rows.length} {"תוך "}
            {table.getFilteredRowModel().rows.length} שורות נבחרו.
          </div>
          {Object.keys(rowSelection).length > 0 && (
            <div
              onClick={handleDeleteRows}
              className="cursor-pointer hover:scale-[1.03] text-foreground "
            >
              <Trash2Icon className="cursor-pointer" />
            </div>
          )}
          {actionButton}
        </div>
      </div>
      <div className="rounded-md border max-h-[75vh] overflow-auto">
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
    </>
  );
}
