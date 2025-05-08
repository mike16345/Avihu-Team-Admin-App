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
import { FilterIcon } from "lucide-react";
import { RowData } from "@tanstack/react-table";
import { usePagination } from "@/hooks/usePagination";
import DeleteButton from "../ui/buttons/DeleteButton";

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

/**
 * Renders a fully featured, RTL, Hebrew-localized data table with sorting, filtering, pagination, row selection, and customizable actions.
 *
 * The table supports column visibility toggling, bulk row deletion, and double-click row viewing. UI elements and messages are presented in Hebrew, and the layout is optimized for right-to-left display.
 *
 * @param columns - Column definitions for the table.
 * @param data - Array of data objects to display in the table.
 * @param actionButton - Optional React node rendered alongside table controls for custom actions.
 * @param handleViewData - Callback invoked when a row is double-clicked, receiving the row's data.
 * @param handleDeleteData - Callback invoked to delete a row or multiple selected rows.
 * @param handleViewNestedData - Callback for viewing nested data related to a row.
 * @param handleSetData - Callback for updating a row's data.
 * @param getRowClassName - Function returning a CSS class name for a given row's data.
 *
 * @returns A React element rendering the interactive data table with all controls and features.
 */
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
    <div className="space-y-1">
      <div className="w-full flex flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-center">
        <Input
          placeholder="חיפוש..."
          value={(table.getColumn("שם")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("שם")?.setFilterValue(event.target.value)}
          className="sm:w-72"
        />

        <div className=" shrink-0 block sm:hidden text-sm text-muted-foreground sm:text-right text-center">
          {table.getFilteredSelectedRowModel().rows.length} {"תוך "}
          {table.getFilteredRowModel().rows.length} שורות נבחרו.
        </div>
        <div className="text-sm  flex items-center gap-4 ">
          <div className="text-muted-foreground">
            דף {pageNumber} תוך {table.getPageCount()}
          </div>
          {Object.keys(rowSelection).length > 0 && (
            <div className=" shrink-0 hidden sm:block text-sm text-muted-foreground sm:text-right text-center">
              {table.getFilteredSelectedRowModel().rows.length} {"תוך "}
              {table.getFilteredRowModel().rows.length} שורות נבחרו.
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {Object.keys(rowSelection).length > 0 && (
            <DeleteButton onClick={handleDeleteRows} tip="הסר משתמשים" />
          )}
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                סינון עמודות
                <FilterIcon size={15} className="mr-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
    </div>
  );
}
