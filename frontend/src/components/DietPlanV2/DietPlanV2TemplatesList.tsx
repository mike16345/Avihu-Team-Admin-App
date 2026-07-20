import { useEffect, useMemo, useState } from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import {
  FaBookmark,
  FaFire,
  FaMagnifyingGlass,
  FaTrashCan,
  FaTriangleExclamation,
  FaUser,
  FaUtensils,
} from "react-icons/fa6";

import DietPlanV2TemplateFilterMultiSelect from "./DietPlanV2TemplateFilterMultiSelect";
import DietPlanV2TemplatePlanEditor from "./DietPlanV2TemplatePlanEditor";
import {
  readTemplates,
  removeTemplate,
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

type MealsBucket = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8plus";

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

const DietPlanV2TemplatesList: React.FC = () => {
  const [templates, setTemplates] = useState<DietV2Template[]>(() => readTemplates());
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [pendingDelete, setPendingDelete] = useState<DietV2Template | null>(null);
  const [editingPlan, setEditingPlan] = useState<DietV2Template | null>(null);

  useEffect(() => {
    const refresh = () => setTemplates(readTemplates());
    const onStorage = (e: StorageEvent) => {
      if (e.key === TEMPLATES_STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    removeTemplate(pendingDelete.id);
    setTemplates(readTemplates());
    setPendingDelete(null);
  };

  const filtered = useMemo(() => applyFilters(templates, filters), [templates, filters]);

  const hasAny = templates.length > 0;

  return (
    <div dir="rtl" className="flex h-[calc(100vh-160px)] min-h-[480px] flex-col gap-4">
      <FiltersBar filters={filters} onChange={setFilters} />

      {hasAny ? (
        filtered.length === 0 ? (
          <EmptyFiltered />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-1 pt-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onOpenPlan={() => setEditingPlan(template)}
                  onDelete={() => setPendingDelete(template)}
                />
              ))}
            </div>
          </div>
        )
      ) : (
        <EmptyState />
      )}

      <DeleteConfirmDialog
        template={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      {editingPlan && (
        <DietPlanV2TemplatePlanEditor
          template={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={() => setTemplates(readTemplates())}
        />
      )}
    </div>
  );
};

interface DeleteConfirmDialogProps {
  template: DietV2Template | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  template,
  onCancel,
  onConfirm,
}) => (
  <AlertDialogPrimitive.Root
    open={!!template}
    onOpenChange={(open) => {
      if (!open) onCancel();
    }}
  >
    <AlertDialogPrimitive.Portal>
      {/* AlertDialog blocks overlay-to-close by default (destructive
          intent = force explicit choice). We opt in to it because the
          delete flow has a clear Cancel and clicking outside reads as
          "changed my mind, get out". */}
      <AlertDialogPrimitive.Overlay
        onClick={onCancel}
        className="fixed inset-0 z-50 bg-slate-500/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <AlertDialogPrimitive.Content
        dir="rtl"
        className="fixed left-1/2 top-1/2 z-50 flex w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-right shadow-2xl shadow-slate-500/20 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
            <FaTrashCan size={16} />
          </span>
          <div className="flex flex-col gap-1">
            <AlertDialogPrimitive.Title className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              למחוק את התבנית?
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-sm text-slate-500 dark:text-slate-400">
              {template
                ? `התבנית "${template.name}" תימחק לצמיתות ולא ניתן יהיה לשחזרה.`
                : ""}
            </AlertDialogPrimitive.Description>
          </div>
        </div>
        <div className="flex flex-row-reverse items-center justify-start gap-2">
          <AlertDialogPrimitive.Action
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-rose-500/30 transition-all hover:-translate-y-0.5 hover:bg-rose-700"
          >
            <FaTrashCan size={11} />
            מחק תבנית
          </AlertDialogPrimitive.Action>
          <AlertDialogPrimitive.Cancel className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            ביטול
          </AlertDialogPrimitive.Cancel>
        </div>
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  </AlertDialogPrimitive.Root>
);

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

const TemplateCard: React.FC<{
  template: DietV2Template;
  onOpenPlan: () => void;
  onDelete: () => void;
}> = ({ template, onOpenPlan, onDelete }) => (
  <article
    onClick={onOpenPlan}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onOpenPlan();
      }
    }}
    className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-slate-800 dark:bg-slate-900"
  >
    <header className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 flex-col">
        <h3 className="truncate text-lg font-extrabold text-slate-900 dark:text-slate-100">
          {template.name}
        </h3>
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {formatDate(template.savedAt)}
        </span>
      </div>
      {/* Delete must not fall through to the card body click (which
          opens the plan editor). */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="מחק תבנית"
        title="מחק"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
      >
        <FaTrashCan size={13} />
      </button>
    </header>

    <div className="grid grid-cols-2 gap-2">
      <MacroPill icon={<FaFire size={12} />} value={template.macros.calories} unit="קק״ל" tone="calories" />
      <MacroPill icon={<FaUtensils size={12} />} value={template.mealsCount} unit="ארוחות" />
    </div>
    <div className="grid grid-cols-3 gap-2">
      <MacroPill label="חלבון" value={template.macros.protein} unit="ג׳" />
      <MacroPill label="פחמ׳" value={template.macros.carbs} unit="ג׳" />
      <MacroPill label="שומן" value={template.macros.fat} unit="ג׳" />
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
      <p className="flex items-start gap-1.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
        <FaTriangleExclamation size={12} className="mt-0.5" />
        <span>{template.allergies}</span>
      </p>
    )}
    {template.builtBy && (
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <FaUser size={11} /> {template.builtBy}
      </p>
    )}
    {template.notes && (
      <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
        {template.notes}
      </p>
    )}
    {template.macrosOverridden && (
      <p className="text-[11px] italic text-slate-400 dark:text-slate-500">
        ערכי מאקרו נערכו ידנית
      </p>
    )}
  </article>
);

const MacroPill: React.FC<{
  label?: string;
  value: number;
  unit: string;
  tone?: "default" | "calories";
  icon?: React.ReactNode;
}> = ({ label, value, unit, tone, icon }) => (
  <span
    className={`inline-flex items-center justify-between gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold ${
      tone === "calories"
        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
    }`}
  >
    {/* Text sits at the RTL start (right edge), icon at the RTL end
        (left edge) so the pill reads: value/unit on the right,
        emoji-style icon anchoring the opposite side. */}
    <span>
      <strong className="text-base font-extrabold">{value}</strong>{" "}
      <span className="text-[10px] font-semibold text-current/70">{unit}</span>
    </span>
    <span className="flex items-center gap-1.5 text-xs">
      {label}
      {icon}
    </span>
  </span>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
      <FaBookmark size={18} />
    </div>
    <div className="flex flex-col gap-1">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
        עדיין אין תבניות בסגנון החדש
      </h3>
      <p className="max-w-md text-[13px] text-slate-500 dark:text-slate-400">
        תבניות של הסגנון החדש יופיעו כאן ברגע שתלחץ על "שמור כתבנית" בעורך
        התפריט של אחד המתאמנים.
      </p>
    </div>
  </div>
);

const EmptyFiltered: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
    לא נמצאו תבניות שתואמות את הסינון.
  </div>
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

export default DietPlanV2TemplatesList;
