import { useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  FaBookmark,
  FaFire,
  FaMagnifyingGlass,
  FaTriangleExclamation,
  FaUser,
  FaUtensils,
} from "react-icons/fa6";

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import DietPlanV2TemplateFilterMultiSelect from "./DietPlanV2TemplateFilterMultiSelect";
import {
  readTemplates,
  TEMPLATE_DIET_TAG_LABELS,
  TEMPLATE_GENDER_LABELS,
  TEMPLATE_GOAL_LABELS,
  TEMPLATES_STORAGE_KEY,
  type DietV2DietTag,
  type DietV2Template,
  type DietV2TemplateGender,
  type DietV2TemplateGoal,
} from "./dietPlanV2Templates";

type CalorieBucket =
  | "under1400"
  | "1400_1800"
  | "1800_2200"
  | "2200_2600"
  | "over2600";
type MealsBucket = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8plus";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (template: DietV2Template) => void;
}

const CALORIE_BUCKETS: {
  value: CalorieBucket;
  label: string;
  min: number | null;
  max: number | null;
}[] = [
  { value: "under1400", label: "עד 1400", min: null, max: 1400 },
  { value: "1400_1800", label: "1400 – 1800", min: 1400, max: 1800 },
  { value: "1800_2200", label: "1800 – 2200", min: 1800, max: 2200 },
  { value: "2200_2600", label: "2200 – 2600", min: 2200, max: 2600 },
  { value: "over2600", label: "2600+", min: 2600, max: null },
];

const MEAL_COUNT_OPTIONS: {
  value: MealsBucket;
  label: string;
  min: number | null;
  max: number | null;
}[] = [
  { value: "1", label: "1 ארוחה", min: 1, max: 1 },
  { value: "2", label: "2 ארוחות", min: 2, max: 2 },
  { value: "3", label: "3 ארוחות", min: 3, max: 3 },
  { value: "4", label: "4 ארוחות", min: 4, max: 4 },
  { value: "5", label: "5 ארוחות", min: 5, max: 5 },
  { value: "6", label: "6 ארוחות", min: 6, max: 6 },
  { value: "7", label: "7 ארוחות", min: 7, max: 7 },
  { value: "8plus", label: "8+ ארוחות", min: 8, max: null },
];

interface Filters {
  query: string;
  calorieBuckets: CalorieBucket[];
  mealsBuckets: MealsBucket[];
  goals: DietV2TemplateGoal[];
  targetGenders: DietV2TemplateGender[];
  dietTags: DietV2DietTag[];
}

const initialFilters: Filters = {
  query: "",
  calorieBuckets: [],
  mealsBuckets: [],
  goals: [],
  targetGenders: [],
  dietTags: [],
};

const DietPlanV2TemplatePickerDialog: React.FC<Props> = ({ open, onOpenChange, onApply }) => {
  const [templates, setTemplates] = useState<DietV2Template[]>(() => readTemplates());
  const [filters, setFilters] = useState<Filters>(initialFilters);

  useEffect(() => {
    if (!open) return;
    setTemplates(readTemplates());
    setFilters(initialFilters);
    const onStorage = (e: StorageEvent) => {
      if (e.key === TEMPLATES_STORAGE_KEY) setTemplates(readTemplates());
    };
    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, [open]);

  const filtered = useMemo(() => applyFilters(templates, filters), [templates, filters]);

  const totalCount = templates.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Lighter, frosted overlay instead of the shared shadcn
            bg-black/80 — the picker is a workflow surface, not a
            destructive confirm, so it shouldn't feel like an alert. */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-slate-500/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          dir="rtl"
          className="fixed left-1/2 top-1/2 z-50 flex h-[90vh] max-h-[90vh] w-[96vw] max-w-[1500px] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-500/20 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:border-slate-800 dark:bg-slate-900"
        >
          <DialogPrimitive.Close className="absolute top-4 rounded-md p-1 text-slate-400 opacity-70 transition-opacity hover:bg-slate-100 hover:text-slate-600 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-200/60 ltr:right-4 rtl:left-4 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
            <span className="sr-only">סגור</span>
          </DialogPrimitive.Close>
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-right">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <FaBookmark size={13} />
            </span>
            טעינת תבנית קיימת
          </DialogTitle>
          <DialogDescription className="text-right">
            בחר תבנית והיא תיטען אוטומטית לתפריט של המתאמן. השינויים לא ישפיעו על
            התבנית המקורית.
          </DialogDescription>
        </DialogHeader>

        {totalCount === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <FiltersBar filters={filters} onChange={setFilters} />

            <div className="min-h-0 flex-1 overflow-y-auto px-1 pt-2">
              {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-16 text-center text-sm italic text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
                  לא נמצאו תבניות שתואמות לסינון.
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((template) => (
                    <li key={template.id}>
                      <TemplateCard template={template} onSelect={() => onApply(template)} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

const applyFilters = (templates: DietV2Template[], filters: Filters): DietV2Template[] => {
  const q = filters.query.trim().toLowerCase();
  const selectedCalRanges = CALORIE_BUCKETS.filter((b) => filters.calorieBuckets.includes(b.value));
  const selectedMealRanges = MEAL_COUNT_OPTIONS.filter((b) => filters.mealsBuckets.includes(b.value));

  const matched = templates.filter((t) => {
    if (q) {
      const haystack = [t.name, t.allergies, t.builtBy, t.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (selectedCalRanges.length > 0) {
      const inAny = selectedCalRanges.some(
        (b) =>
          (b.min == null || t.macros.calories >= b.min) &&
          (b.max == null || t.macros.calories <= b.max)
      );
      if (!inAny) return false;
    }
    if (selectedMealRanges.length > 0) {
      const inAny = selectedMealRanges.some(
        (b) =>
          (b.min == null || t.mealsCount >= b.min) &&
          (b.max == null || t.mealsCount <= b.max)
      );
      if (!inAny) return false;
    }
    if (filters.goals.length > 0 && (!t.goal || !filters.goals.includes(t.goal))) return false;
    if (filters.targetGenders.length > 0) {
      const templateGender = t.targetGender ?? "both";
      const matches =
        templateGender === "both" || filters.targetGenders.includes(templateGender);
      if (!matches) return false;
    }
    if (filters.dietTags.length > 0) {
      const tags = t.dietTags ?? [];
      if (!filters.dietTags.every((tag) => tags.includes(tag))) return false;
    }
    return true;
  });

  return [...matched].sort((a, b) => b.savedAt.localeCompare(a.savedAt));
};

interface FiltersBarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
}

const FiltersBar: React.FC<FiltersBarProps> = ({ filters, onChange }) => {
  const patch = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  return (
    <div className="shrink-0 rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-50/40 to-white p-4 dark:border-blue-900/40 dark:from-blue-950/30 dark:to-slate-900">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-9 min-w-[280px] flex-1 items-center gap-2 rounded-lg border border-blue-200 bg-white px-2.5 shadow-sm shadow-blue-500/5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200/60 dark:border-blue-900/40 dark:bg-slate-900">
          <FaMagnifyingGlass size={12} className="text-blue-500" />
          <input
            value={filters.query}
            onChange={(e) => patch({ query: e.target.value })}
            placeholder="חיפוש שם תבנית…"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          />
        </span>

        <DietPlanV2TemplateFilterMultiSelect
          placeholder="מטרה"
          selected={filters.goals}
          onChange={(next) => patch({ goals: next as DietV2TemplateGoal[] })}
          options={(Object.keys(TEMPLATE_GOAL_LABELS) as DietV2TemplateGoal[]).map((key) => ({
            value: key,
            label: TEMPLATE_GOAL_LABELS[key],
          }))}
        />
        <DietPlanV2TemplateFilterMultiSelect
          placeholder="מין"
          selected={filters.targetGenders}
          onChange={(next) => patch({ targetGenders: next as DietV2TemplateGender[] })}
          options={(Object.keys(TEMPLATE_GENDER_LABELS) as DietV2TemplateGender[]).map((key) => ({
            value: key,
            label: TEMPLATE_GENDER_LABELS[key],
          }))}
        />
        <DietPlanV2TemplateFilterMultiSelect
          placeholder="קלוריות"
          selected={filters.calorieBuckets}
          onChange={(next) => patch({ calorieBuckets: next as CalorieBucket[] })}
          options={CALORIE_BUCKETS.map((b) => ({ value: b.value, label: b.label }))}
        />
        <DietPlanV2TemplateFilterMultiSelect
          placeholder="מספר ארוחות"
          selected={filters.mealsBuckets}
          onChange={(next) => patch({ mealsBuckets: next as MealsBucket[] })}
          options={MEAL_COUNT_OPTIONS.map((b) => ({ value: b.value, label: b.label }))}
        />
        <DietPlanV2TemplateFilterMultiSelect
          placeholder="אלרגיות / הגבלות"
          selected={filters.dietTags}
          onChange={(next) => patch({ dietTags: next as DietV2DietTag[] })}
          options={(Object.keys(TEMPLATE_DIET_TAG_LABELS) as DietV2DietTag[]).map((key) => ({
            value: key,
            label: TEMPLATE_DIET_TAG_LABELS[key],
          }))}
          minWidth={170}
        />
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: DietV2Template;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className="flex h-full w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm transition-all hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
  >
    <div className="flex items-baseline justify-between gap-2">
      <span className="truncate text-lg font-extrabold text-slate-900 dark:text-slate-100">
        {template.name}
      </span>
      <span className="shrink-0 text-xs font-semibold text-slate-400 dark:text-slate-500">
        {formatDate(template.savedAt)}
      </span>
    </div>
    <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
      <MacroPill
        icon={<FaFire size={12} />}
        value={template.macros.calories}
        unit="קק״ל"
        tone="calories"
      />
      <MacroPill
        icon={<FaUtensils size={12} />}
        value={template.mealsCount}
        unit="ארוחות"
      />
      <MacroPill label="ח" value={template.macros.protein} unit="ג׳" />
      <MacroPill label="פ" value={template.macros.carbs} unit="ג׳" />
      <MacroPill label="ש" value={template.macros.fat} unit="ג׳" />
    </div>
    {(template.goal || template.targetGender || (template.dietTags && template.dietTags.length > 0)) && (
      <div className="flex flex-wrap items-center gap-1.5">
        {template.goal && (
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {TEMPLATE_GOAL_LABELS[template.goal]}
          </span>
        )}
        {template.targetGender && (
          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            {TEMPLATE_GENDER_LABELS[template.targetGender]}
          </span>
        )}
        {template.dietTags?.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
          >
            {TEMPLATE_DIET_TAG_LABELS[tag]}
          </span>
        ))}
      </div>
    )}
    {template.allergies && (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
        <FaTriangleExclamation size={11} />
        {template.allergies}
      </span>
    )}
    {template.builtBy && (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <FaUser size={10} />
        {template.builtBy}
      </span>
    )}
    {template.notes && (
      <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
        {template.notes}
      </p>
    )}
  </button>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 px-4 py-16 text-center dark:border-slate-800 dark:bg-slate-950/40">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
      <FaBookmark size={16} />
    </div>
    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">אין תבניות עדיין</p>
    <p className="max-w-sm text-[12px] text-slate-500 dark:text-slate-400">
      לחץ על "שמור כתבנית" בעורך אחרי שתבנה תפריט, והיא תופיע כאן לשימוש חוזר על
      מתאמנים אחרים.
    </p>
  </div>
);

const MacroPill: React.FC<{
  label?: string;
  value: number;
  unit: string;
  tone?: "default" | "calories";
  icon?: React.ReactNode;
}> = ({ label, value, unit, tone, icon }) => (
  <span
    className={`inline-flex items-center justify-between gap-1.5 rounded-md px-2.5 py-1 ${
      tone === "calories"
        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
    }`}
  >
    {/* Text on the RTL start (visual right), icon on the RTL end
        (visual left) — matches the templates-page pill layout. */}
    <span className="inline-flex items-baseline gap-1">
      <strong className="text-sm font-extrabold">{value}</strong>
      <span className="text-[10px] font-semibold text-current/70">{unit}</span>
    </span>
    <span className="inline-flex items-center gap-1">
      {label && <span className="text-[11px] font-semibold">{label}</span>}
      {icon}
    </span>
  </span>
);

const formatDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export default DietPlanV2TemplatePickerDialog;
