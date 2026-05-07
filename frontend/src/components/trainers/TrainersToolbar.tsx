import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Plus, RotateCcw, Search } from "lucide-react";

type TrainersToolbarProps = {
  searchValue: string;
  statusFilter: string;
  planFilter: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onPlanFilterChange: (value: string) => void;
  onResetFilters: () => void;
  onAddTrainer: () => void;
};

export const TrainersToolbar = ({
  searchValue,
  statusFilter,
  planFilter,
  hasActiveFilters,
  onSearchChange,
  onStatusFilterChange,
  onPlanFilterChange,
  onResetFilters,
  onAddTrainer,
}: TrainersToolbarProps) => {
  return (
    <div className="rounded-[28px] border border-border bg-background p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-start md:flex-none   w-full md:max-w-[450px] lg:max-w-[600px]">
          <div className="relative w-full  ">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="חפש מאמן לפי שם, אימייל או מספר..."
              className="h-11 w-full rounded-xl border-none bg-muted pr-10 text-right placeholder:text-muted-foreground"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0 rounded-xl border-border px-4 text-muted-foreground"
              >
                <Filter className="ml-2 h-4 w-4" />
                סינון
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[280px] space-y-4" dir="rtl">
              <div className="space-y-2">
                <div className="text-sm font-medium ">סטטוס</div>
                <Select dir="rtl" value={statusFilter} onValueChange={onStatusFilterChange}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="כל הסטטוסים" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסטטוסים</SelectItem>
                    <SelectItem value="active">פעיל</SelectItem>
                    <SelectItem value="blocked">חסום</SelectItem>
                    <SelectItem value="inactive">לא פעיל</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium ">תוכנית</div>
                <Select dir="rtl" value={planFilter} onValueChange={onPlanFilterChange}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="כל התוכניות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל התוכניות</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="basic">בסיסי</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={onResetFilters}
                disabled={!hasActiveFilters}
                className="w-full justify-center text-primary"
              >
                <RotateCcw className="ml-2 h-4 w-4" />
                איפוס מסננים
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        <Button type="button" onClick={onAddTrainer} className=" rounded-xl  px-5 font-bold">
          <Plus className="ml-2 h-4 w-4" />
          הוסף מאמן
        </Button>
      </div>
    </div>
  );
};
