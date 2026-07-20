import { useEffect, useState } from "react";
import { FaBookmark, FaCheck, FaFire, FaUtensils } from "react-icons/fa6";

import type { DietV2Plan } from "@/interfaces/IDietPlanV2";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  buildTemplateId,
  computePlanMacroTotals,
  TEMPLATE_DIET_TAG_LABELS,
  TEMPLATE_GENDER_LABELS,
  TEMPLATE_GOAL_LABELS,
  upsertTemplate,
  type DietV2DietTag,
  type DietV2Template,
  type DietV2TemplateGender,
  type DietV2TemplateGoal,
} from "./dietPlanV2Templates";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: DietV2Plan;
  onSaved?: (template: DietV2Template) => void;
  defaultBuiltBy?: string;
}

const DietPlanV2TemplateSaveDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  plan,
  onSaved,
  defaultBuiltBy = "",
}) => {
  const autoTotals = computePlanMacroTotals(plan);
  const mealsCount = plan.meals.length;

  const [name, setName] = useState("");
  const [protein, setProtein] = useState<number>(autoTotals.protein);
  const [carbs, setCarbs] = useState<number>(autoTotals.carbs);
  const [fat, setFat] = useState<number>(autoTotals.fat);
  const [calories, setCalories] = useState<number>(autoTotals.calories);
  const [goal, setGoal] = useState<DietV2TemplateGoal | "">("");
  const [targetGender, setTargetGender] = useState<DietV2TemplateGender | "">("");
  const [dietTags, setDietTags] = useState<DietV2DietTag[]>([]);
  const [allergies, setAllergies] = useState("");
  const [builtBy, setBuiltBy] = useState(defaultBuiltBy);
  const [notes, setNotes] = useState("");
  const [macrosOverridden, setMacrosOverridden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    const totals = computePlanMacroTotals(plan);
    setName(`תבנית ${plan.meals.length} ארוחות`);
    setProtein(totals.protein);
    setCarbs(totals.carbs);
    setFat(totals.fat);
    setCalories(totals.calories);
    setGoal("");
    setTargetGender("");
    setDietTags([]);
    setAllergies("");
    setBuiltBy(defaultBuiltBy);
    setNotes("");
    setMacrosOverridden(false);
    setError(null);
    setSaved(false);
  }, [open, plan, defaultBuiltBy]);

  const markMacroChanged = () => setMacrosOverridden(true);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("שם התבנית חובה");
      return;
    }
    const template: DietV2Template = {
      id: buildTemplateId(),
      name: trimmed,
      savedAt: new Date().toISOString(),
      builtBy: builtBy.trim() || undefined,
      allergies: allergies.trim() || undefined,
      notes: notes.trim() || undefined,
      goal: goal || undefined,
      targetGender: targetGender || undefined,
      dietTags: dietTags.length > 0 ? dietTags : undefined,
      mealsCount,
      macros: { protein, carbs, fat, calories },
      macrosOverridden,
      plan,
    };
    upsertTemplate(template);
    setSaved(true);
    onSaved?.(template);
    window.setTimeout(() => onOpenChange(false), 700);
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
            כל התבניות מופיעות בעמוד "תפריטים" ואפשר לחפש בהן לפי שם, קלוריות
            ומספר ארוחות.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Field label="שם התבנית" required>
            <input
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="למשל: תפריט 1800 קל׳ · ללא גלוטן"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-slate-100 ${
                error
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200/40"
                  : "border-slate-200 focus:border-blue-400 focus:ring-blue-200/40 dark:border-slate-700"
              }`}
            />
            {error && <span className="text-[11px] font-bold text-rose-600">{error}</span>}
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <ReadOnlyField label="מספר ארוחות" icon={<FaUtensils size={10} />}>
              <span className="font-bold text-slate-800 dark:text-slate-100">{mealsCount}</span>
            </ReadOnlyField>
            <MacroInput
              label="קלוריות"
              value={calories}
              onChange={(v) => {
                setCalories(v);
                markMacroChanged();
              }}
              suffix="קק״ל"
              tone="calories"
              icon={<FaFire size={10} />}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MacroInput
              label="חלבון"
              value={protein}
              onChange={(v) => {
                setProtein(v);
                markMacroChanged();
              }}
              suffix="גרם"
            />
            <MacroInput
              label="פחמימות"
              value={carbs}
              onChange={(v) => {
                setCarbs(v);
                markMacroChanged();
              }}
              suffix="גרם"
            />
            <MacroInput
              label="שומן"
              value={fat}
              onChange={(v) => {
                setFat(v);
                markMacroChanged();
              }}
              suffix="גרם"
            />
          </div>

          {macrosOverridden && (
            <p className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              ערכי המאקרו נערכו ידנית — יישמרו כפי שרשמת ולא יחושבו מחדש
              אוטומטית.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Field label="מטרה">
              <TemplateSelect
                value={goal}
                onChange={(v) => setGoal(v as DietV2TemplateGoal | "")}
                options={[
                  { value: "", label: "לא נבחר" },
                  ...(Object.keys(TEMPLATE_GOAL_LABELS) as DietV2TemplateGoal[]).map(
                    (key) => ({ value: key, label: TEMPLATE_GOAL_LABELS[key] })
                  ),
                ]}
              />
            </Field>
            <Field label="מין המתאמן">
              <TemplateSelect
                value={targetGender}
                onChange={(v) => setTargetGender(v as DietV2TemplateGender | "")}
                options={[
                  { value: "", label: "לא נבחר" },
                  ...(Object.keys(TEMPLATE_GENDER_LABELS) as DietV2TemplateGender[]).map(
                    (key) => ({ value: key, label: TEMPLATE_GENDER_LABELS[key] })
                  ),
                ]}
              />
            </Field>
          </div>

          <Field label="אלרגיות / הגבלות">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(TEMPLATE_DIET_TAG_LABELS) as DietV2DietTag[]).map((tag) => {
                const isSelected = dietTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setDietTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )
                    }
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                      isSelected
                        ? "border-teal-500 bg-teal-500 text-white shadow-sm shadow-teal-500/25"
                        : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    {TEMPLATE_DIET_TAG_LABELS[tag]}
                  </button>
                );
              })}
            </div>
            <input
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="הערות נוספות (אופציונלי)…"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </Field>

          <Field label="נבנה ע״י">
            <input
              value={builtBy}
              onChange={(e) => setBuiltBy(e.target.value)}
              placeholder="שם המאמן שבנה את התבנית"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </Field>

          <Field label="הערות (אופציונלי)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="כל דבר נוסף שיעזור לזהות מתי להשתמש בתבנית — סוג האימון, שלב הדיאטה וכו׳"
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </Field>
        </div>

        <DialogFooter className="flex flex-row-reverse justify-start gap-2 sm:flex-row-reverse sm:justify-start">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saved}
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
  <label className="flex flex-col gap-1 text-right">
    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
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
  <div className="flex flex-col gap-1 text-right">
    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{label}</span>
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/40">
      <span className="text-slate-400">{icon}</span>
      {children}
    </div>
  </div>
);

const MacroInput: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  tone?: "default" | "calories";
  icon?: React.ReactNode;
}> = ({ label, value, onChange, suffix, tone, icon }) => (
  <div className="flex flex-col gap-1 text-right">
    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{label}</span>
    <div
      className={`flex items-center gap-1 rounded-lg border bg-white px-2 py-1 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200/40 dark:bg-slate-900 ${
        tone === "calories"
          ? "border-rose-200 dark:border-rose-900/40"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      {icon && <span className={tone === "calories" ? "text-rose-500" : "text-slate-400"}>{icon}</span>}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className={`min-w-0 flex-1 bg-transparent text-center text-sm font-extrabold focus:outline-none ${
          tone === "calories" ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-100"
        }`}
      />
      <span className="text-[10px] font-semibold text-slate-400">{suffix}</span>
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

export default DietPlanV2TemplateSaveDialog;
