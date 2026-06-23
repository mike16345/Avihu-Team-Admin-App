import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DietaryRestriction, DietGoal } from "@/interfaces/IDietPlan";
import { CalorieBucket } from "@/lib/dietMeta";
import { useSubTrainersQuery } from "@/hooks/queries/subTrainers/useSubTrainersQuery";
import { useUsersStore } from "@/store/userStore";
import DietPlanPresetPickerActiveFilters from "./DietPlanPresetPickerActiveFilters";
import DietPlanPresetPickerFilterPanel from "./DietPlanPresetPickerFilterPanel";
import DietPlanPresetPickerHeader from "./DietPlanPresetPickerHeader";
import DietPlanPresetPickerResults from "./DietPlanPresetPickerResults";
import DietPlanPresetPickerToolbar from "./DietPlanPresetPickerToolbar";
import {
  DEFAULT_OPEN_DIET_PICKER_SECTIONS,
  DietPickerFilters,
  DietPickerPreset,
  getActiveDietFilterCount,
  getBuilderOptions,
  matchesDietPickerPreset,
} from "./dietPlanPresetPickerUtils";

interface DietPlanPresetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: DietPickerPreset[];
  onSelect: (preset: DietPickerPreset) => void;
}

const DietPlanPresetPicker = ({
  open,
  onOpenChange,
  presets,
  onSelect,
}: DietPlanPresetPickerProps) => {
  const [search, setSearch] = useState("");
  const [goals, setGoals] = useState<DietGoal[]>([]);
  const [buckets, setBuckets] = useState<CalorieBucket[]>([]);
  const [proteinServings, setProteinServings] = useState<string[]>([]);
  const [carbServings, setCarbServings] = useState<string[]>([]);
  const [fatServings, setFatServings] = useState<string[]>([]);
  const [freeCalories, setFreeCalories] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [builders, setBuilders] = useState<string[]>([]);
  const [mealCounts, setMealCounts] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN_DIET_PICKER_SECTIONS);

  const currentUser = useUsersStore((state) => state.currentUser);
  const { data: subTrainers = [] } = useSubTrainersQuery();

  const builderOptions = useMemo(
    () => getBuilderOptions(currentUser, subTrainers),
    [currentUser, subTrainers]
  );

  const getBuilderLabel = (id?: string) =>
    builderOptions.find((builder) => builder.value === id)?.label;

  const filters = useMemo<DietPickerFilters>(
    () => ({
      search,
      goals,
      buckets,
      proteinServings,
      carbServings,
      fatServings,
      freeCalories,
      restrictions,
      builders,
      mealCounts,
    }),
    [
      search,
      goals,
      buckets,
      proteinServings,
      carbServings,
      fatServings,
      freeCalories,
      restrictions,
      builders,
      mealCounts,
    ]
  );

  const filteredPresets = useMemo(
    () => presets.filter((preset) => matchesDietPickerPreset(preset, filters)),
    [presets, filters]
  );

  const activeChipCount = getActiveDietFilterCount({
    goals,
    buckets,
    proteinServings,
    carbServings,
    fatServings,
    freeCalories,
    restrictions,
    builders,
    mealCounts,
  });
  const hasActiveFilters = Boolean(search) || activeChipCount > 0;

  const clearAll = useCallback(() => {
    setSearch("");
    setGoals([]);
    setBuckets([]);
    setProteinServings([]);
    setCarbServings([]);
    setFatServings([]);
    setFreeCalories([]);
    setRestrictions([]);
    setBuilders([]);
    setMealCounts([]);
  }, []);

  const toggleSection = (id: string) => {
    setOpenSections((currentSections) => ({
      ...currentSections,
      [id]: !currentSections[id],
    }));
  };

  const handleSelectPreset = (preset: DietPickerPreset) => {
    onSelect(preset);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) clearAll();
  }, [clearAll, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="flex h-[92vh] max-h-[92vh] w-[95vw] !max-w-[1280px] flex-col gap-0 overflow-hidden rounded-2xl p-0 font-['Assistant','Heebo',system-ui,sans-serif]"
      >
        <DietPlanPresetPickerHeader />

        <div className="flex flex-1 overflow-hidden">
          {filtersOpen && (
            <DietPlanPresetPickerFilterPanel
              openSections={openSections}
              onToggleSection={toggleSection}
              onClose={() => setFiltersOpen(false)}
              mealCounts={mealCounts}
              setMealCounts={setMealCounts}
              goals={goals}
              setGoals={setGoals}
              buckets={buckets}
              setBuckets={setBuckets}
              proteinServings={proteinServings}
              setProteinServings={setProteinServings}
              carbServings={carbServings}
              setCarbServings={setCarbServings}
              fatServings={fatServings}
              setFatServings={setFatServings}
              freeCalories={freeCalories}
              setFreeCalories={setFreeCalories}
              restrictions={restrictions}
              setRestrictions={setRestrictions}
              builders={builders}
              setBuilders={setBuilders}
              builderOptions={builderOptions}
              activeChipCount={activeChipCount}
              filteredCount={filteredPresets.length}
              onClearAll={clearAll}
            />
          )}

          <div className="flex flex-1 flex-col overflow-hidden bg-slate-50/60 dark:bg-slate-950/40">
            <DietPlanPresetPickerToolbar
              search={search}
              onSearchChange={setSearch}
              filteredCount={filteredPresets.length}
              totalCount={presets.length}
              filtersOpen={filtersOpen}
              onToggleFilters={() => setFiltersOpen((currentValue) => !currentValue)}
              activeChipCount={activeChipCount}
            />

            {hasActiveFilters && (
              <DietPlanPresetPickerActiveFilters
                mealCounts={mealCounts}
                setMealCounts={setMealCounts}
                goals={goals}
                setGoals={setGoals}
                buckets={buckets}
                setBuckets={setBuckets}
                proteinServings={proteinServings}
                setProteinServings={setProteinServings}
                carbServings={carbServings}
                setCarbServings={setCarbServings}
                fatServings={fatServings}
                setFatServings={setFatServings}
                freeCalories={freeCalories}
                setFreeCalories={setFreeCalories}
                restrictions={restrictions}
                setRestrictions={setRestrictions}
                builders={builders}
                setBuilders={setBuilders}
                getBuilderLabel={getBuilderLabel}
                onClearAll={clearAll}
              />
            )}

            <div className="flex-1 overflow-y-auto p-6">
              <DietPlanPresetPickerResults
                presets={filteredPresets}
                totalCount={presets.length}
                hasActiveFilters={hasActiveFilters}
                onClearAll={clearAll}
                onSelectPreset={handleSelectPreset}
                getBuilderLabel={getBuilderLabel}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DietPlanPresetPicker;
