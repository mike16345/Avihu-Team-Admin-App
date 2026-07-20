import { useState } from "react";
import { FaArrowRight, FaBowlFood, FaTag } from "react-icons/fa6";

import DietPlanV2Editor from "./DietPlanV2Editor";
import DietPlanV2TemplateMetaPanel, {
  type DietV2TemplateMetaValues,
} from "./DietPlanV2TemplateMetaPanel";
import { normaliseSupplements } from "./dietPlanV2Supplements";
import {
  computePlanMacroTotals,
  upsertTemplate,
  type DietV2Template,
} from "./dietPlanV2Templates";

interface Props {
  template: DietV2Template;
  onClose: () => void;
  onSaved: (updated: DietV2Template) => void;
}

const DietPlanV2TemplatePlanEditor: React.FC<Props> = ({ template, onClose, onSaved }) => {
  const initialMeta: DietV2TemplateMetaValues = {
    goal: template.goal ?? "",
    targetGender: template.targetGender ?? "",
    dietTags: template.dietTags ?? [],
    builtBy: template.builtBy ?? "",
    notes: template.notes ?? "",
  };
  const [name, setName] = useState(template.name);
  const [meta, setMeta] = useState<DietV2TemplateMetaValues>(initialMeta);
  const [baseline, setBaseline] = useState(() => ({
    name: template.name,
    meta: initialMeta,
  }));

  const metaDirty =
    name !== baseline.name ||
    JSON.stringify(meta) !== JSON.stringify(baseline.meta);

  const [seed] = useState(() => ({
    meals: template.plan.meals,
    freeCalories: template.plan.freeCalories,
    highlights: "",
    supplements: normaliseSupplements([]),
  }));

  const patchMeta = (patch: Partial<DietV2TemplateMetaValues>) =>
    setMeta((prev) => ({ ...prev, ...patch }));

  const handlePersist = (nextPlan: typeof seed) => {
    const plan = { meals: nextPlan.meals, freeCalories: nextPlan.freeCalories };
    const updated: DietV2Template = {
      ...template,
      name: name.trim() || template.name,
      goal: meta.goal || undefined,
      targetGender: meta.targetGender || undefined,
      dietTags: meta.dietTags.length > 0 ? meta.dietTags : undefined,
      builtBy: meta.builtBy.trim() || undefined,
      notes: meta.notes.trim() || undefined,
      mealsCount: nextPlan.meals.length,
      macros: computePlanMacroTotals(plan),
      macrosOverridden: false,
      plan,
    };
    upsertTemplate(updated);
    setBaseline({ name, meta });
    onSaved(updated);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-slate-50 font-heebo dark:bg-slate-950"
    >
      <div className="sticky top-0 z-10 flex items-center justify-end border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          חזרה לתבניות
          <FaArrowRight size={11} />
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-6">
        <div className="relative overflow-hidden rounded-2xl border border-blue-100/60 bg-white shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
          <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-950/30" />
          <div className="relative flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl brand-gradient text-white shadow-md shadow-blue-500/25">
              <FaBowlFood size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">עריכת תבנית תזונה</h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                תבנית חוזרת לשימוש על מתאמנים — שם, מאפיינים, ארוחות ואופציות
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100/60 bg-white p-5 shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <FaTag size={10} />
              שם התבנית
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: תפריט 1800 קל׳ · ללא גלוטן"
              className="h-11 w-full rounded-xl border border-blue-100/60 bg-blue-50/30 px-3 text-base font-semibold text-slate-800 placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200/60 dark:border-blue-900/40 dark:bg-blue-950/15 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </label>
        </div>

        <DietPlanV2TemplateMetaPanel values={meta} onChange={patchMeta} />

        <DietPlanV2Editor
          initialPlan={seed}
          onPersist={handlePersist}
          mode="template"
          saveLabel="שמור שינויים בתבנית"
          forceDirty={metaDirty}
        />
      </div>
    </div>
  );
};

export default DietPlanV2TemplatePlanEditor;
