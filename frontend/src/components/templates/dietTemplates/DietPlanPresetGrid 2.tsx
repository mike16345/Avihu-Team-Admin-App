import React, { useMemo, useState } from "react";
import {
  FaBreadSlice,
  FaBullseye,
  FaCircleExclamation,
  FaDroplet,
  FaDrumstickBite,
  FaFire,
  FaMagnifyingGlass,
  FaPlus,
  FaSeedling,
  FaStar,
  FaUtensils,
} from "react-icons/fa6";
import { DietaryRestriction, DietGoal } from "@/interfaces/IDietPlan";
import {
  CALORIE_BUCKETS,
  CalorieBucket,
  CARB_OPTIONS,
  dietGoalOptions,
  dietaryRestrictionOptions,
  FAT_OPTIONS,
  FREE_CAL_OPTIONS,
  PROTEIN_OPTIONS,
} from "@/lib/dietMeta";
import { useUsersStore } from "@/store/userStore";
import { useSubTrainersQuery } from "@/hooks/queries/subTrainers/useSubTrainersQuery";
import { useFavoriteDietPresets } from "@/hooks/useFavoriteDietPresets";
import DietPlanPresetCard from "./DietPlanPresetCard";
import DietPresetFilterDropdown from "./DietPresetFilterDropdown";
import {
  BuilderOption,
  DietPresetFilters,
  DietPresetItem,
  getEmptyStateLabel,
  getFavoriteButtonClassName,
  getFavoriteCountClassName,
  getFavoriteSortWeight,
  getPresetCountLabel,
  matchesDietPreset,
  MEAL_COUNT_OPTIONS,
  toggleSelection,
} from "./dietPlanPresetGridUtils";

interface DietPlanPresetGridProps {
  data: DietPresetItem[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNew?: () => void;
  addLabel?: string;
}

const getBuilderOptions = (
  currentUser?: { _id?: string; firstName?: string; lastName?: string } | null,
  subTrainers: { _id?: string; fullName?: string }[] = []
): BuilderOption[] => {
  const builderOptions: BuilderOption[] = [];

  if (currentUser?._id) {
    builderOptions.push({
      value: currentUser._id,
      label: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || "אני",
    });
  }

  subTrainers.forEach((trainer) => {
    if (trainer._id) {
      builderOptions.push({ value: trainer._id, label: trainer.fullName || "ללא שם" });
    }
  });

  return builderOptions;
};

const DietPlanPresetGrid: React.FC<DietPlanPresetGridProps> = ({
  data,
  onOpen,
  onDelete,
  onAddNew,
  addLabel = "הוסף תפריט",
}) => {
  const [search, setSearch] = useState("");
  const [goals, setGoals] = useState<DietGoal[]>([]);
  const [buckets, setBuckets] = useState<CalorieBucket[]>([]);
  const [proteinServings, setProteinServings] = useState<string[]>([]);
  const [carbServings, setCarbServings] = useState<string[]>([]);
  const [fatServings, setFatServings] = useState<string[]>([]);
  const [freeCalories, setFreeCalories] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [mealCounts, setMealCounts] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const currentUser = useUsersStore((state) => state.currentUser);
  const { data: subTrainers = [] } = useSubTrainersQuery();
  const { isFavorite, count: favoritesCount } = useFavoriteDietPresets();

  const builderOptions = useMemo(
    () => getBuilderOptions(currentUser, subTrainers),
    [currentUser, subTrainers]
  );

  const builderLabel = (id?: string) =>
    builderOptions.find((builder) => builder.value === id)?.label;

  const filters: DietPresetFilters = useMemo(
    () => ({
      search,
      goals,
      buckets,
      proteinServings,
      carbServings,
      fatServings,
      freeCalories,
      restrictions,
      mealCounts,
      favoritesOnly,
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
      mealCounts,
      favoritesOnly,
    ]
  );

  const filtered = useMemo(() => {
    const matches = data.filter((preset) => matchesDietPreset(preset, filters, isFavorite));

    return [...matches].sort((first, second) => {
      const firstWeight = getFavoriteSortWeight(first, isFavorite);
      const secondWeight = getFavoriteSortWeight(second, isFavorite);

      return secondWeight - firstWeight;
    });
  }, [data, filters, isFavorite]);

  const hasActiveFilters =
    goals.length +
      buckets.length +
      proteinServings.length +
      carbServings.length +
      fatServings.length +
      freeCalories.length +
      restrictions.length +
      mealCounts.length >
    0;
  const hasNoResults = filtered.length === 0;
  const presetCountLabel = getPresetCountLabel(filtered.length);
  const emptyStateLabel = getEmptyStateLabel(data.length);

  const clearFilters = () => {
    setGoals([]);
    setBuckets([]);
    setProteinServings([]);
    setCarbServings([]);
    setFatServings([]);
    setFreeCalories([]);
    setRestrictions([]);
    setMealCounts([]);
  };

  return (
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] max-w-[360px] flex-1">
            <FaMagnifyingGlass
              size={11}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="חיפוש לפי שם תפריט…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pr-8 pl-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-900"
            />
          </div>

          <DietPresetFilterDropdown
            label="מספר ארוחות"
            icon={<FaUtensils size={11} />}
            tone="indigo"
            options={MEAL_COUNT_OPTIONS}
            selected={mealCounts}
            onToggle={(value) => setMealCounts(toggleSelection(mealCounts, value))}
          />
          <DietPresetFilterDropdown
            label="הגבלות"
            icon={<FaCircleExclamation size={11} />}
            tone="rose"
            options={dietaryRestrictionOptions}
            selected={restrictions}
            onToggle={(value) =>
              setRestrictions(toggleSelection(restrictions, value as DietaryRestriction))
            }
          />
          <DietPresetFilterDropdown
            label="סוג תפריט"
            icon={<FaBullseye size={11} />}
            tone="violet"
            options={dietGoalOptions}
            selected={goals}
            onToggle={(value) => setGoals(toggleSelection(goals, value))}
          />
          <DietPresetFilterDropdown
            label="קלוריות"
            icon={<FaFire size={11} />}
            tone="amber"
            options={CALORIE_BUCKETS.map((bucket) => ({
              value: bucket.value,
              label: bucket.label,
            }))}
            selected={buckets}
            onToggle={(value) => setBuckets(toggleSelection(buckets, value as CalorieBucket))}
          />
          <DietPresetFilterDropdown
            label="חלבון"
            icon={<FaDrumstickBite size={11} />}
            tone="pink"
            options={PROTEIN_OPTIONS}
            selected={proteinServings}
            onToggle={(value) => setProteinServings(toggleSelection(proteinServings, value))}
          />
          <DietPresetFilterDropdown
            label="פחמ׳"
            icon={<FaBreadSlice size={11} />}
            tone="orange"
            options={CARB_OPTIONS}
            selected={carbServings}
            onToggle={(value) => setCarbServings(toggleSelection(carbServings, value))}
          />
          <DietPresetFilterDropdown
            label="שומן"
            icon={<FaDroplet size={11} />}
            tone="sky"
            options={FAT_OPTIONS}
            selected={fatServings}
            onToggle={(value) => setFatServings(toggleSelection(fatServings, value))}
          />
          <DietPresetFilterDropdown
            label="חופשיות"
            icon={<FaSeedling size={11} />}
            tone="emerald"
            options={FREE_CAL_OPTIONS}
            selected={freeCalories}
            onToggle={(value) => setFreeCalories(toggleSelection(freeCalories, value))}
          />

          <button
            type="button"
            onClick={() => setFavoritesOnly((value) => !value)}
            aria-pressed={favoritesOnly}
            className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all ${getFavoriteButtonClassName(
              favoritesOnly
            )}`}
          >
            <FaStar size={11} />
            מועדפים
            {favoritesCount > 0 && (
              <span
                className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${getFavoriteCountClassName(
                  favoritesOnly
                )}`}
              >
                {favoritesCount}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600"
            >
              נקה סינון
            </button>
          )}

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filtered.length} {presetCountLabel}
            {filtered.length !== data.length && ` מתוך ${data.length}`}
          </span>

          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="ms-auto inline-flex items-center gap-2 rounded-xl brand-gradient brand-gradient-hover px-4 py-2 text-sm font-bold text-white shadow-sm"
            >
              <FaPlus size={11} />
              {addLabel}
            </button>
          )}
        </div>
      </div>

      {hasNoResults && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm dark:bg-slate-800">
            <FaUtensils size={18} />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
            {emptyStateLabel}
          </p>
        </div>
      )}

      {!hasNoResults && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((preset) => (
            <DietPlanPresetCard
              key={preset._id || preset.name}
              preset={preset}
              builderName={builderLabel(preset.builtByTrainerId)}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DietPlanPresetGrid;
