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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  handleViewData: (data: TData) => void;
  handleSetData: (data: TData) => void;
  handleDeleteData: (data: TData) => void;
  handleViewNestedData: (data: any | any[], id: string) => void;
}

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    handleViewData: (data: TData) => void;
    handleSetData: (data: TData) => void;
    handleDeleteData: (data: TData) => void;
    handleViewNestedData: (data: any | any[], id: string) => void;
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  handleViewData,
  handleDeleteData,
  handleViewNestedData,
  handleSetData,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

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
    },

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDeleteRows = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    selectedRows.forEach(async (row) => await handleDeleteData(row.original));
    setRowSelection({});
  };

  return (
    <div>
      <div className="flex flex-col ">
        <div className="flex items-center py-4 gap-4">
          <Input
            placeholder="Search..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <FilterIcon size={15} className="mr-2" /> Filter Columns
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
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mb-3 text-sm  flex items-center justify-between ">
          <div className="text-muted-foreground">
            Page {pageNumber} of {table.getPageCount()}
          </div>

          {Object.keys(rowSelection).length > 0 && (
            <div
              onClick={handleDeleteRows}
              className="cursor-pointer hover:scale-[1.03] text-foreground "
            >
              <Trash2Icon className="cursor-pointer" />
            </div>
          )}
        </div>
      </div>
      <div className="rounded-md border max-h-[75vh] overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.previousPage();
            setPageNumber((page) => page - 1);
          }}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.nextPage();
            setPageNumber((page) => page + 1);
          }}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}