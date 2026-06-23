import { FaSliders, FaXmark } from "react-icons/fa6";
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
import { DietPickerChipGrid, DietPickerFilterSection } from "./DietPlanPresetPickerPrimitives";
import { BuilderOption, MEAL_COUNT_OPTIONS, toggleIn } from "./dietPlanPresetPickerUtils";

type DietPlanPresetPickerFilterPanelProps = {
  openSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  onClose: () => void;
  mealCounts: string[];
  setMealCounts: React.Dispatch<React.SetStateAction<string[]>>;
  goals: DietGoal[];
  setGoals: React.Dispatch<React.SetStateAction<DietGoal[]>>;
  buckets: CalorieBucket[];
  setBuckets: React.Dispatch<React.SetStateAction<CalorieBucket[]>>;
  proteinServings: string[];
  setProteinServings: React.Dispatch<React.SetStateAction<string[]>>;
  carbServings: string[];
  setCarbServings: React.Dispatch<React.SetStateAction<string[]>>;
  fatServings: string[];
  setFatServings: React.Dispatch<React.SetStateAction<string[]>>;
  freeCalories: string[];
  setFreeCalories: React.Dispatch<React.SetStateAction<string[]>>;
  restrictions: DietaryRestriction[];
  setRestrictions: React.Dispatch<React.SetStateAction<DietaryRestriction[]>>;
  builders: string[];
  setBuilders: React.Dispatch<React.SetStateAction<string[]>>;
  builderOptions: BuilderOption[];
  activeChipCount: number;
  filteredCount: number;
  onClearAll: () => void;
};

const DietPlanPresetPickerFilterPanel = ({
  openSections,
  onToggleSection,
  onClose,
  mealCounts,
  setMealCounts,
  goals,
  setGoals,
  buckets,
  setBuckets,
  proteinServings,
  setProteinServings,
  carbServings,
  setCarbServings,
  fatServings,
  setFatServings,
  freeCalories,
  setFreeCalories,
  restrictions,
  setRestrictions,
  builders,
  setBuilders,
  builderOptions,
  activeChipCount,
  filteredCount,
  onClearAll,
}: DietPlanPresetPickerFilterPanelProps) => (
  <aside className="flex w-[320px] shrink-0 flex-col border-l border-slate-200 bg-gradient-to-b from-slate-200/70 via-slate-100/80 to-slate-200/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
    <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white/40 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300">
          <FaSliders size={12} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">סינון תפריטים</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            התאם את התפריטים לצרכים שלך
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="סגור פאנל סינון"
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
      >
        <FaXmark size={11} />
      </button>
    </div>

    <div className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
      <DietPickerFilterSection
        id="mealCount"
        title="מספר ארוחות"
        expanded={openSections.mealCount}
        onToggle={onToggleSection}
        count={mealCounts.length}
      >
        <DietPickerChipGrid
          options={MEAL_COUNT_OPTIONS}
          selected={mealCounts}
          onToggle={(value) => setMealCounts(toggleIn(mealCounts, value))}
        />
      </DietPickerFilterSection>

      <DietPickerFilterSection
        id="goal"
        title="סוג תפריט"
        expanded={openSections.goal}
        onToggle={onToggleSection}
        count={goals.length}
      >
        <DietPickerChipGrid
          options={dietGoalOptions}
          selected={goals}
          onToggle={(value) => setGoals(toggleIn(goals, value as DietGoal))}
        />
      </DietPickerFilterSection>

      <DietPickerFilterSection
        id="calories"
        title="קלוריות"
        expanded={openSections.calories}
        onToggle={onToggleSection}
        count={buckets.length}
      >
        <DietPickerChipGrid
          options={CALORIE_BUCKETS.map((bucket) => ({
            value: bucket.value,
            label: bucket.label,
          }))}
          selected={buckets}
          onToggle={(value) => setBuckets(toggleIn(buckets, value as CalorieBucket))}
        />
      </DietPickerFilterSection>

      <DietPickerFilterSection
        id="macros"
        title="מאקרו"
        expanded={openSections.macros}
        onToggle={onToggleSection}
        count={proteinServings.length + carbServings.length + fatServings.length}
      >
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">חלבון</p>
            <DietPickerChipGrid
              options={PROTEIN_OPTIONS}
              selected={proteinServings}
              onToggle={(value) => setProteinServings(toggleIn(proteinServings, value))}
            />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">פחמ׳</p>
            <DietPickerChipGrid
              options={CARB_OPTIONS}
              selected={carbServings}
              onToggle={(value) => setCarbServings(toggleIn(carbServings, value))}
            />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">שומן</p>
            <DietPickerChipGrid
              options={FAT_OPTIONS}
              selected={fatServings}
              onToggle={(value) => setFatServings(toggleIn(fatServings, value))}
            />
          </div>
        </div>
      </DietPickerFilterSection>

      <DietPickerFilterSection
        id="freeCal"
        title="קלוריות חופשיות"
        expanded={openSections.freeCal}
        onToggle={onToggleSection}
        count={freeCalories.length}
      >
        <DietPickerChipGrid
          options={FREE_CAL_OPTIONS}
          selected={freeCalories}
          onToggle={(value) => setFreeCalories(toggleIn(freeCalories, value))}
        />
      </DietPickerFilterSection>

      <DietPickerFilterSection
        id="restrictions"
        title="הגבלות תזונה"
        expanded={openSections.restrictions}
        onToggle={onToggleSection}
        count={restrictions.length}
      >
        <DietPickerChipGrid
          options={dietaryRestrictionOptions}
          selected={restrictions}
          onToggle={(value) => setRestrictions(toggleIn(restrictions, value as DietaryRestriction))}
        />
      </DietPickerFilterSection>

      {builderOptions.length > 0 && (
        <DietPickerFilterSection
          id="builder"
          title="מאמן שבנה"
          expanded={openSections.builder}
          onToggle={onToggleSection}
          count={builders.length}
        >
          <DietPickerChipGrid
            options={builderOptions}
            selected={builders}
            onToggle={(value) => setBuilders(toggleIn(builders, value))}
          />
        </DietPickerFilterSection>
      )}
    </div>

    <div className="border-t border-slate-200 bg-white/40 px-5 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
          {filteredCount} תוצאות
        </span>
        {activeChipCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <FaXmark size={9} />
            נקה הכל
          </button>
        )}
      </div>
    </div>
  </aside>
);

export default DietPlanPresetPickerFilterPanel;
