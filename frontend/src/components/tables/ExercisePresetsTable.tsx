import { ReactNode, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IExercisePresetItem } from "@/interfaces/IWorkoutPlan";
import { DataTableHebrew } from "./DataTableHebrew";
import FilterMultiSelect from "./FilterMultiSelect";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const columns: ColumnDef<IExercisePresetItem>[] = [
  {
    accessorKey: "name",
    id: "שם",
    header: "שם התרגיל",
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
  },
  {
    accessorKey: "muscleGroup",
    header: "קבוצת שריר",
  },
  {
    accessorKey: "exerciseMethod",
    header: "שיטת אימון",
    cell: ({ row }) => row.original.exerciseMethod || "-",
  },
  {
    accessorKey: "linkToVideo",
    header: "לינק לסרטון",
    cell: ({ row }) => (
      row.original.linkToVideo ? (
        <a
          href={row.original.linkToVideo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          צפייה
        </a>
      ) : (
        "-"
      )
    ),
  },
  {
    id: "actions",
    header: "פעולות",
    enableHiding: false,
    cell: ({ row, table }) => {
      const exercise = row.original;
      const handleView = table.options.meta?.handleViewData;
      const handleDelete = table.options.meta?.handleDeleteData;

      return (
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">פתח תפריט</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>פעולות</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleView?.(exercise)}>צפה</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete?.(exercise)}>מחק</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface ExercisePresetsTableProps {
  data: IExercisePresetItem[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  actionButton?: ReactNode;
}

const ExercisePresetsTable = ({
  data,
  onView,
  onDelete,
  actionButton,
}: ExercisePresetsTableProps) => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const filterOptions = useMemo(() => {
    const groups = new Set<string>();

    data.forEach((item) => {
      const rowGroups = Array.isArray((item as any).muscleGroups)
        ? ((item as any).muscleGroups as string[])
        : item.muscleGroup
        ? [item.muscleGroup]
        : [];

      rowGroups.filter(Boolean).forEach((group) => groups.add(group));
    });

    return Array.from(groups).map((group) => ({ label: group, value: group }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!selectedGroups.length) {
      return data;
    }

    return data.filter((item) => {
      const rowGroups = Array.isArray((item as any).muscleGroups)
        ? ((item as any).muscleGroups as string[])
        : item.muscleGroup
        ? [item.muscleGroup]
        : [];

      return rowGroups.some((group) => selectedGroups.includes(group));
    });
  }, [data, selectedGroups]);

  return (
    <DataTableHebrew
      data={filteredData}
      columns={columns}
      actionButton={actionButton}
      filters={
        filterOptions.length ? (
          <FilterMultiSelect
            label="קבוצות שריר"
            options={filterOptions}
            selected={selectedGroups}
            onChange={setSelectedGroups}
            placeholder="כל הקבוצות"
          />
        ) : null
      }
      handleViewData={(exercise) => {
        if (exercise._id) {
          onView(exercise._id);
        }
      }}
      handleSetData={() => {}}
      handleDeleteData={(exercise) => {
        if (exercise._id) {
          onDelete(exercise._id);
        }
      }}
      handleViewNestedData={() => {}}
      getRowClassName={() => ""}
    />
  );
};

export default ExercisePresetsTable;
