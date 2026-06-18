import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WorkoutEquipment, WorkoutGoal, WorkoutLevel } from "@/interfaces/IWorkoutPlan";
import { fullWorkoutPlanSchema, WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { defaultSimpleCardioOption } from "@/constants/cardioOptions";
import { useFavoriteWorkoutPresets } from "@/hooks/useFavoriteWorkoutPresets";
import WorkoutPresetPickerActiveFilters from "./WorkoutPresetPickerActiveFilters";
import WorkoutPresetPickerFilterPanel from "./WorkoutPresetPickerFilterPanel";
import WorkoutPresetPickerHeader from "./WorkoutPresetPickerHeader";
import WorkoutPresetPickerPreview from "./WorkoutPresetPickerPreview";
import WorkoutPresetPickerResults from "./WorkoutPresetPickerResults";
import WorkoutPresetPickerToolbar from "./WorkoutPresetPickerToolbar";
import {
  ActiveDurationFilter,
  ActiveWeekFilter,
  getActiveWorkoutFilterCount,
  getFavoriteSortWeight,
  matchesWorkoutPickerPreset,
  WorkoutPickerFilters,
  WorkoutPickerPreset,
} from "./workoutPresetPickerUtils";

interface WorkoutPresetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: WorkoutPickerPreset[];
  onSelect: (preset: WorkoutPickerPreset) => void;
}

const DEFAULT_OPEN_SECTIONS: Record<string, boolean> = {
  muscle: true,
  level: true,
  duration: true,
  equipment: false,
  goal: false,
  week: false,
};

const WorkoutPresetPicker: React.FC<WorkoutPresetPickerProps> = ({
  open,
  onOpenChange,
  presets,
  onSelect,
}) => {
  const [search, setSearch] = useState("");
  const [weekFilter, setWeekFilter] = useState<ActiveWeekFilter[]>([]);
  const [durationFilter, setDurationFilter] = useState<ActiveDurationFilter[]>([]);
  const [levelFilter, setLevelFilter] = useState<WorkoutLevel[]>([]);
  const [goalFilter, setGoalFilter] = useState<WorkoutGoal[]>([]);
  const [equipmentFilter, setEquipmentFilter] = useState<WorkoutEquipment[]>([]);
  const [muscleFilter, setMuscleFilter] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [openSections, setOpenSections] = useState(DEFAULT_OPEN_SECTIONS);
  const [preview, setPreview] = useState<WorkoutPickerPreset | null>(null);
  const { isFavorite, count: favoritesCount } = useFavoriteWorkoutPresets();

  const editorForm = useForm<WorkoutSchemaType>({
    resolver: zodResolver(fullWorkoutPlanSchema),
    defaultValues: {
      tips: [],
      cardio: { type: "simple", plan: defaultSimpleCardioOption },
      workoutPlans: [],
    },
  });

  const filters: WorkoutPickerFilters = useMemo(
    () => ({
      search,
      weekFilter,
      durationFilter,
      levelFilter,
      goalFilter,
      equipmentFilter,
      muscleFilter,
      favoritesOnly,
    }),
    [
      search,
      weekFilter,
      durationFilter,
      levelFilter,
      goalFilter,
      equipmentFilter,
      muscleFilter,
      favoritesOnly,
    ]
  );

  const filtered = useMemo(() => {
    const matches = presets.filter((preset) =>
      matchesWorkoutPickerPreset(preset, filters, isFavorite)
    );

    return [...matches].sort((first, second) => {
      const firstWeight = getFavoriteSortWeight(first, isFavorite);
      const secondWeight = getFavoriteSortWeight(second, isFavorite);

      return secondWeight - firstWeight;
    });
  }, [presets, filters, isFavorite]);

  const activeChipCount = getActiveWorkoutFilterCount({
    weekFilter,
    durationFilter,
    levelFilter,
    goalFilter,
    equipmentFilter,
    muscleFilter,
  });
  const hasActiveFilters = Boolean(search) || activeChipCount > 0;

  const clearAll = () => {
    setSearch("");
    setWeekFilter([]);
    setDurationFilter([]);
    setLevelFilter([]);
    setGoalFilter([]);
    setEquipmentFilter([]);
    setMuscleFilter([]);
  };

  const toggleSection = (id: string) => {
    setOpenSections((sections) => ({ ...sections, [id]: !sections[id] }));
  };

  const handleOpenPreview = (preset: WorkoutPickerPreset) => {
    setPreview(preset);
    editorForm.reset({
      workoutPlans: preset.workoutPlans ?? [],
      cardio: preset.cardio || { type: "simple", plan: defaultSimpleCardioOption },
      tips: preset.tips ?? [],
      workoutsPerWeek: preset.workoutsPerWeek,
      durationMinutes: preset.durationMinutes,
      level: preset.level,
      goal: preset.goal,
      muscleFocus: preset.muscleFocus,
      note: preset.note,
      limitations: preset.limitations,
    });
  };

  const handleConfirmPick = () => {
    if (!preview) return;

    const edited = editorForm.getValues();
    onSelect({ ...preview, ...(edited as any) });
    onOpenChange(false);
  };

  const handleBack = () => {
    setPreview(null);
  };

  useEffect(() => {
    if (!open) return;

    setSearch("");
    setWeekFilter([]);
    setDurationFilter([]);
    setLevelFilter([]);
    setGoalFilter([]);
    setEquipmentFilter([]);
    setMuscleFilter([]);
    setPreview(null);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="!max-w-[1280px] flex h-[92vh] max-h-[92vh] w-[95vw] flex-col gap-0 overflow-hidden rounded-2xl p-0 font-heebo"
      >
        <WorkoutPresetPickerHeader preview={preview} onBack={handleBack} />

        {!preview && (
          <div className="flex flex-1 flex-row-reverse overflow-hidden">
            <div className="flex flex-1 flex-col overflow-hidden bg-slate-50/60 dark:bg-slate-950/40">
              <WorkoutPresetPickerToolbar
                search={search}
                onSearchChange={setSearch}
                filteredCount={filtered.length}
                totalCount={presets.length}
                favoritesOnly={favoritesOnly}
                onToggleFavorites={() => setFavoritesOnly((value) => !value)}
                favoritesCount={favoritesCount}
                filtersOpen={filtersOpen}
                onToggleFilters={() => setFiltersOpen((value) => !value)}
                activeChipCount={activeChipCount}
              />

              {hasActiveFilters && (
                <WorkoutPresetPickerActiveFilters
                  weekFilter={weekFilter}
                  setWeekFilter={setWeekFilter}
                  durationFilter={durationFilter}
                  setDurationFilter={setDurationFilter}
                  levelFilter={levelFilter}
                  setLevelFilter={setLevelFilter}
                  goalFilter={goalFilter}
                  setGoalFilter={setGoalFilter}
                  equipmentFilter={equipmentFilter}
                  setEquipmentFilter={setEquipmentFilter}
                  muscleFilter={muscleFilter}
                  setMuscleFilter={setMuscleFilter}
                  onClearAll={clearAll}
                />
              )}

              <div className="flex-1 overflow-y-auto p-6">
                <WorkoutPresetPickerResults
                  presets={filtered}
                  hasActiveFilters={hasActiveFilters}
                  onClearAll={clearAll}
                  onOpenPreview={handleOpenPreview}
                />
              </div>
            </div>

            {filtersOpen && (
              <WorkoutPresetPickerFilterPanel
                openSections={openSections}
                onToggleSection={toggleSection}
                onClose={() => setFiltersOpen(false)}
                weekFilter={weekFilter}
                setWeekFilter={setWeekFilter}
                durationFilter={durationFilter}
                setDurationFilter={setDurationFilter}
                levelFilter={levelFilter}
                setLevelFilter={setLevelFilter}
                goalFilter={goalFilter}
                setGoalFilter={setGoalFilter}
                equipmentFilter={equipmentFilter}
                setEquipmentFilter={setEquipmentFilter}
                muscleFilter={muscleFilter}
                setMuscleFilter={setMuscleFilter}
                hasActiveFilters={hasActiveFilters}
                activeChipCount={activeChipCount}
                filteredCount={filtered.length}
                onClearAll={clearAll}
              />
            )}
          </div>
        )}

        {preview && (
          <WorkoutPresetPickerPreview
            editorForm={editorForm}
            preview={preview}
            onBack={handleBack}
            onConfirm={handleConfirmPick}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WorkoutPresetPicker;
