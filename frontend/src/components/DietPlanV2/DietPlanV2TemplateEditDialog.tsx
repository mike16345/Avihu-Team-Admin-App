import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { FaBookmark, FaCheck, FaFire, FaPen, FaUtensils } from "react-icons/fa6";

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  upsertTemplate,
  TEMPLATE_DIET_TAG_LABELS,
  TEMPLATE_GENDER_LABELS,
  TEMPLATE_GOAL_LABELS,
  type DietV2DietTag,
  type DietV2Template,
  type DietV2TemplateGender,
  type DietV2TemplateGoal,
} from "./dietPlanV2Templates";

interface Props {
  template: DietV2Template | null;
  onOpenChange: (open: boolean) => void;
  onSaved?: (template: DietV2Template) => void;
}

const DietPlanV2TemplateEditDialog: React.FC<Props> = ({
  template,
  onOpenChange,
  onSaved,
}) => {
  const [name, setName] = useState("");
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [calories, setCalories] = useState(0);
  const [goal, setGoal] = useState<DietV2TemplateGoal | "">("");
  const [targetGender, setTargetGender] = useState<DietV2TemplateGender | "">("");
  const [dietTags, setDietTags] = useState<DietV2DietTag[]>([]);
  const [allergies, setAllergies] = useState("");
  const [builtBy, setBuiltBy] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!template) return;
    setName(template.name);
    setProtein(template.macros.protein);
    setCarbs(template.macros.carbs);
    setFat(template.macros.fat);
    setCalories(template.macros.calories);
    setGoal(template.goal ?? "");
    setTargetGender(template.targetGender ?? "");
    setDietTags(template.dietTags ?? []);
    setAllergies(template.allergies ?? "");
    setBuiltBy(template.builtBy ?? "");
    setNotes(template.notes ?? "");
    setError(null);
    setSaved(false);
  }, [template]);

  if (!template) return null;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("שם התבנית חובה");
      return;
    }
    const next: DietV2Template = {
      ...template,
      name: trimmed,
      macros: { protein, carbs, fat, calories },
      goal: goal || undefined,
      targetGender: targetGender || undefined,
      dietTags: dietTags.length > 0 ? dietTags : undefined,
      allergies: allergies.trim() || undefined,
      builtBy: builtBy.trim() || undefined,
      notes: notes.trim() || undefined,
      macrosOverridden:
        template.macrosOverridden ||
        protein !== template.macros.protein ||
        carbs !== template.macros.carbs ||
        fat !== template.macros.fat ||
        calories !== template.macros.calories,
    };
    upsertTemplate(next);
    setSaved(true);
    onSaved?.(next);
    window.setTimeout(() => onOpenChange(false), 600);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-500/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          dir="rtl"
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[94vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-500/20 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:border-slate-800 dark:bg-slate-900"
        >
          <DialogPrimitive.Close className="absolute top-4 rounded-md p-1 text-slate-400 opacity-70 transition-opacity hover:bg-slate-100 hover:text-slate-600 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-200/60 ltr:right-4 rtl:left-4 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
            <span className="sr-only">סגור</span>
          </DialogPrimitive.Close>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-right">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                <FaPen size={12} />
              </span>
              עריכת תבנית
            </DialogTitle>
            <DialogDescription className="text-right">
              שינויים נשמרים על אותה התבנית — התוכן של הארוחות עצמן לא משתנה,
              רק המידע מסביב (שם, מאקרו, סימונים).
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Field label="שם התבנית" required error={error}>
              <input
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-slate-100 ${
                  error
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200/40"
                    : "border-slate-200 focus:border-blue-400 focus:ring-blue-200/40 dark:border-slate-700"
                }`}
              />
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <ReadOnlyField label="מספר ארוחות" icon={<FaUtensils size={10} />}>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {template.mealsCount}
                </span>
              </ReadOnlyField>
              <MacroInput
                label="קלוריות"
                value={calories}
                onChange={setCalories}
                suffix="קק״ל"
                tone="calories"
                icon={<FaFire size={10} />}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MacroInput label="חלבון" value={protein} onChange={setProtein} suffix="גרם" />
              <MacroInput label="פחמימות" value={carbs} onChange={setCarbs} suffix="גרם" />
              <MacroInput label="שומן" value={fat} onChange={setFat} suffix="גרם" />
            </div>

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
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </Field>

            <Field label="הערות (אופציונלי)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </Field>
          </div>

          <div className="flex flex-row-reverse items-center justify-start gap-2">
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
                  <FaBookmark size={11} /> שמור שינויים
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
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

const Field: React.FC<{
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <label className="flex flex-col gap-1 text-right">
    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
      {label}
      {required && <span className="ms-1 text-rose-500">*</span>}
    </span>
    {children}
    {error && <span className="text-[11px] font-bold text-rose-600">{error}</span>}
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
        className={`min-w-0 flex-1 bg-transparent text-center text-sm font-extrabold focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
          tone === "calories" ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-100"
        }`}
      />
      <span className="text-[10px] font-semibold text-slate-400">{suffix}</span>
    </div>
  </div>
);

const TemplateSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => (
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

export default DietPlanV2TemplateEditDialog;
