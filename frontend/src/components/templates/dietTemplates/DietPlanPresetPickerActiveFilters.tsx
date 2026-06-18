import { FaXmark } from "react-icons/fa6";
import { DietaryRestriction, DietGoal } from "@/interfaces/IDietPlan";
import { CalorieBucket } from "@/lib/dietMeta";
import { DietPickerActiveChip } from "./DietPlanPresetPickerPrimitives";
import {
  bucketLabelOf,
  freeCalorieLabelOf,
  goalLabelOf,
  proteinLabelOf,
  carbLabelOf,
  fatLabelOf,
  restrictionLabelOf,
} from "./dietPlanPresetPickerUtils";

type DietPlanPresetPickerActiveFiltersProps = {
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
  getBuilderLabel: (id?: string) => string | undefined;
  onClearAll: () => void;
};

const DietPlanPresetPickerActiveFilters = ({
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
  getBuilderLabel,
  onClearAll,
}: DietPlanPresetPickerActiveFiltersProps) => (
  <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-white/70 px-6 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
    {mealCounts.map((mealCount) => (
      <DietPickerActiveChip
        key={`m-${mealCount}`}
        label={`${mealCount} ארוחות`}
        onRemove={() =>
          setMealCounts((previous) => previous.filter((value) => value !== mealCount))
        }
      />
    ))}
    {goals.map((goal) => (
      <DietPickerActiveChip
        key={`g-${goal}`}
        label={goalLabelOf(goal)}
        onRemove={() => setGoals((previous) => previous.filter((value) => value !== goal))}
      />
    ))}
    {buckets.map((bucket) => (
      <DietPickerActiveChip
        key={`b-${bucket}`}
        label={bucketLabelOf(bucket)}
        onRemove={() => setBuckets((previous) => previous.filter((value) => value !== bucket))}
      />
    ))}
    {proteinServings.map((protein) => (
      <DietPickerActiveChip
        key={`p-${protein}`}
        label={`חלבון ${proteinLabelOf(protein)}`}
        onRemove={() =>
          setProteinServings((previous) => previous.filter((value) => value !== protein))
        }
      />
    ))}
    {carbServings.map((carb) => (
      <DietPickerActiveChip
        key={`c-${carb}`}
        label={`פחמ׳ ${carbLabelOf(carb)}`}
        onRemove={() => setCarbServings((previous) => previous.filter((value) => value !== carb))}
      />
    ))}
    {fatServings.map((fat) => (
      <DietPickerActiveChip
        key={`f-${fat}`}
        label={`שומן ${fatLabelOf(fat)}`}
        onRemove={() => setFatServings((previous) => previous.filter((value) => value !== fat))}
      />
    ))}
    {freeCalories.map((freeCalorie) => (
      <DietPickerActiveChip
        key={`fc-${freeCalorie}`}
        label={freeCalorieLabelOf(freeCalorie)}
        onRemove={() =>
          setFreeCalories((previous) => previous.filter((value) => value !== freeCalorie))
        }
      />
    ))}
    {restrictions.map((restriction) => (
      <DietPickerActiveChip
        key={`r-${restriction}`}
        label={restrictionLabelOf(restriction)}
        onRemove={() =>
          setRestrictions((previous) => previous.filter((value) => value !== restriction))
        }
      />
    ))}
    {builders.map((builderId) => (
      <DietPickerActiveChip
        key={`bu-${builderId}`}
        label={`מאמן: ${getBuilderLabel(builderId) || builderId}`}
        onRemove={() => setBuilders((previous) => previous.filter((value) => value !== builderId))}
      />
    ))}
    <button
      type="button"
      onClick={onClearAll}
      className="ms-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
    >
      <FaXmark size={10} />
      נקה הכל
    </button>
  </div>
);

export default DietPlanPresetPickerActiveFilters;
