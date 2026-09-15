import { useEffect, useRef, useState } from "react";
import { FaBookmark, FaCheck, FaChevronDown, FaFire, FaUtensils, FaXmark } from "react-icons/fa6";

import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import { useCreateDietPlanV2Preset } from "@/hooks/mutations/DietPlans/useDietPlanV2PresetMutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  computeTemplateMacroTotals,
  presetToTemplate,
  TEMPLATE_DIET_TAG_LABELS,
  TEMPLATE_GENDER_LABELS,
  TEMPLATE_GOAL_LABELS,
  type DietV2DietTag,
  type DietV2Template,
  type DietV2TemplateGender,
  type DietV2TemplateGoal,
} from "./dietPlanV2Templates";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: IDietPlanV2;
  onSaved?: (template: DietV2Template) => void;
}

const DietPlanV2TemplateSaveDialog: React.FC<Props> = ({ open, onOpenChange, plan, onSaved }) => {
  const createPreset = useCreateDietPlanV2Preset();
  const autoTotals = computeTemplateMacroTotals(plan);
  const mealsCount = plan.meals.length;

  const [name, setName] = useState("");
  const [goal, setGoal] = useState<DietV2TemplateGoal | "">("");
  const [targetGender, setTargetGender] = useState<DietV2TemplateGender | "">("");
  const [dietTags, setDietTags] = useState<DietV2DietTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(`תבנית ${plan.meals.length} ארוחות`);
    setGoal("");
    setTargetGender("");
    setDietTags([]);
    setError(null);
    setSaved(false);
  }, [open, plan]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("שם התבנית חובה");
      return;
    }
    try {
      const response = await createPreset.mutateAsync({
        name: trimmed,
        version: 2,
        meals: plan.meals.map((meal) => ({ ...meal, _id: undefined })),
        highlights: plan.highlights,
        goal: goal || undefined,
        targetGender: targetGender || undefined,
        dietTags: dietTags.length > 0 ? dietTags : undefined,
      });
      const template = presetToTemplate(response.data);
      setSaved(true);
      onSaved?.(template);
      window.setTimeout(() => onOpenChange(false), 700);
    } catch {
      setError("שמירת התבנית נכשלה. אפשר לנסות שוב.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <FaBookmark size={13} />
            </span>
            שמירת תבנית
          </DialogTitle>
          <DialogDescription className="text-right">
            כל התבניות מופיעות בעמוד "תפריטים" ואפשר לחפש בהן לפי שם, קלוריות ומספר ארוחות.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 pt-2">
          <Field label="שם התבנית" required>
            <input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="למשל: תפריט 1800 קל׳ · ללא גלוטן"
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-slate-100 ${
                error
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200/40"
                  : "border-slate-200 focus:border-blue-400 focus:ring-blue-200/40 dark:border-slate-700"
              }`}
            />
            {error && <span className="text-[11px] font-bold text-rose-600">{error}</span>}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <ReadOnlyField label="מספר ארוחות" icon={<FaUtensils size={11} />}>
              <span className="font-bold text-slate-800 dark:text-slate-100">{mealsCount}</span>
            </ReadOnlyField>
            <MacroValue
              label="קלוריות"
              value={autoTotals.calories}
              suffix="קק״ל"
              tone="calories"
              icon={<FaFire size={11} />}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MacroValue label="חלבון" value={autoTotals.protein} suffix="גרם" />
            <MacroValue label="פחמימות" value={autoTotals.carbs} suffix="גרם" />
            <MacroValue label="שומן" value={autoTotals.fat} suffix="גרם" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="מטרה">
              <TemplateSelect
                value={goal}
                onChange={(v) => setGoal(v as DietV2TemplateGoal | "")}
                options={[
                  { value: "", label: "לא נבחר" },
                  ...(Object.keys(TEMPLATE_GOAL_LABELS) as DietV2TemplateGoal[]).map((key) => ({
                    value: key,
                    label: TEMPLATE_GOAL_LABELS[key],
                  })),
                ]}
              />
            </Field>
            <Field label="מין המתאמן">
              <TemplateSelect
                value={targetGender}
                onChange={(v) => setTargetGender(v as DietV2TemplateGender | "")}
                options={[
                  { value: "", label: "לא נבחר" },
                  ...(Object.keys(TEMPLATE_GENDER_LABELS) as DietV2TemplateGender[]).map((key) => ({
                    value: key,
                    label: TEMPLATE_GENDER_LABELS[key],
                  })),
                ]}
              />
            </Field>
          </div>

          <Field label="אלרגיות / הגבלות">
            <DietTagsMultiSelect value={dietTags} onChange={setDietTags} />
          </Field>
        </div>

        <DialogFooter className="flex flex-row-reverse justify-start gap-2 sm:flex-row-reverse sm:justify-start">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saved || createPreset.isPending}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 ${
              saved
                ? "bg-emerald-600 shadow-emerald-500/30"
                : "brand-gradient brand-gradient-hover shadow-blue-500/25"
            }`}
          >
            {saved ? (
              <>
                <FaCheck size={11} /> נשמר
              </>
            ) : (
              <>
                <FaBookmark size={11} /> שמור תבנית
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            ביטול
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label,
  required,
  children,
}) => (
  <label className="flex flex-col gap-1.5 text-right">
    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="ms-1 text-rose-500">*</span>}
    </span>
    {children}
  </label>
);

const ReadOnlyField: React.FC<{
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, icon, children }) => (
  <div className="flex flex-col gap-1.5 text-right">
    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950/40">
      <span className="text-slate-400">{icon}</span>
      {children}
    </div>
  </div>
);

const MacroValue: React.FC<{
  label: string;
  value: number;
  suffix: string;
  tone?: "default" | "calories";
  icon?: React.ReactNode;
}> = ({ label, value, suffix, tone, icon }) => (
  <div className="flex flex-col gap-1 text-right">
    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{label}</span>
    <div
      className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-3 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200/40 dark:bg-slate-900 ${
        tone === "calories"
          ? "border-emerald-200 dark:border-emerald-900/40"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      {icon && (
        <span className={tone === "calories" ? "text-emerald-700" : "text-slate-400"}>{icon}</span>
      )}
      <span
        className={`min-w-0 flex-1 text-center text-base font-extrabold ${
          tone === "calories"
            ? "text-emerald-800 dark:text-emerald-300"
            : "text-slate-800 dark:text-slate-100"
        }`}
      >
        {value}
      </span>
      <span className="text-[11px] font-semibold text-slate-400">{suffix}</span>
    </div>
  </div>
);

interface TemplateSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

const TemplateSelect: React.FC<TemplateSelectProps> = ({ value, onChange, options }) => (
  <span className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-[42px] w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pe-3 ps-8 text-sm font-semibold text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="currentColor"
      className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-blue-500 ltr:right-3 rtl:left-3"
    >
      <path
        fillRule="evenodd"
        d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
        clipRule="evenodd"
      />
    </svg>
  </span>
);

const DietTagsMultiSelect: React.FC<{
  value: DietV2DietTag[];
  onChange: (next: DietV2DietTag[]) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tags = Object.keys(TEMPLATE_DIET_TAG_LABELS) as DietV2DietTag[];

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = (tag: DietV2DietTag) => {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-right text-sm text-slate-700 transition-colors hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <span className="flex flex-1 flex-wrap items-center justify-start gap-1.5">
          {value.length === 0 ? (
            <span className="text-slate-400">לא נבחר</span>
          ) : (
            value.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
              >
                {TEMPLATE_DIET_TAG_LABELS[tag]}
                <FaXmark
                  size={9}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(tag);
                  }}
                  className="cursor-pointer opacity-60 hover:opacity-100"
                />
              </span>
            ))
          )}
        </span>
        <FaChevronDown
          size={11}
          className={`shrink-0 text-blue-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {tags.map((tag) => {
            const isSelected = value.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <span>{TEMPLATE_DIET_TAG_LABELS[tag]}</span>
                {isSelected && <FaCheck size={10} className="text-teal-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DietPlanV2TemplateSaveDialog;
