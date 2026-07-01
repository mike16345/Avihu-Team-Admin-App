import { useMemo, useState } from "react";
import {
  FaApple,
  FaCheck,
  FaClipboardCheck,
  FaCompress,
  FaExpand,
  FaFloppyDisk,
  FaPlus,
  FaWandMagicSparkles,
  FaWeightScale,
  FaFire,
} from "react-icons/fa6";

import type { DietV2Meal, DietV2OptionMacros, DietV2Plan } from "@/interfaces/IDietPlanV2";

import {
  buildEmptyMeal,
  computeMealAverage,
  makeLocalId,
} from "./dietPlanV2Utils";
import MealCard from "./MealCard";

type DietV2Tab = "menu" | "highlights" | "supplements";

interface DietV2PlanExtended extends DietV2Plan {
  highlights: string;
  supplements: string;
}

const DRAFT_STORAGE_KEY = "dietPlanV2:draft";

const buildInitialPlan = (): DietV2PlanExtended => {
  // Hydrate from localStorage draft when available so refresh
  // doesn't wipe the trainer's work. Real save/load through the
  // backend will replace this once the endpoint is wired.
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DietV2PlanExtended;
        if (parsed?.meals?.length) return parsed;
      }
    } catch {
      /* ignore parse errors — start fresh */
    }
  }
  return {
    meals: [buildEmptyMeal(1)],
    highlights: "",
    supplements: "",
  };
};

/**
 * Top-level editor for the v2 ("options") diet plan layout.
 * Local state for now — when the API is wired this becomes the
 * consumer of a query/mutation hook pair (per Agents.md three-step
 * data flow).
 */
const DietPlanV2Editor: React.FC = () => {
  const [plan, setPlan] = useState<DietV2PlanExtended>(() => buildInitialPlan());
  const [tab, setTab] = useState<DietV2Tab>("menu");
  // Collapsed meal IDs live in the editor so a single "collapse
  // all" button can flip everyone at once and each card stays in
  // sync. Individual collapse toggles still work normally.
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [autoFillOpen, setAutoFillOpen] = useState(false);
  // Drag-and-drop state for native HTML5 reorder.
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  // Cosmetic "saved" indicator — flips to "saving" on every edit
  // and clears 800ms later. Real persistence will replace the
  // setTimeout when the mutation hook is wired.
  const [saved, setSaved] = useState(true);

  const markEdited = () => {
    setSaved(false);
  };

  // Save handler — right now this is client-side only because
  // the v2 backend endpoint isn't wired. Once `PUT /diet-plans/:id`
  // exists, swap this for a real mutation hook. The button + dirty
  // indicator is here so trainers stop losing plans to refresh.
  const handleSave = () => {
    setSaved(true);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(plan));
      } catch {
        /* storage unavailable — best effort */
      }
    }
  };

  const mutatePlan = (mutator: (current: DietV2PlanExtended) => DietV2PlanExtended) => {
    setPlan((current) => mutator(current));
    markEdited();
  };

  const updateMeal = (mealId: string, updater: (meal: DietV2Meal) => DietV2Meal) => {
    mutatePlan((current) => ({
      ...current,
      meals: current.meals.map((meal) => (meal.id === mealId ? updater(meal) : meal)),
    }));
  };

  const duplicateMeal = (mealId: string) => {
    mutatePlan((current) => {
      const idx = current.meals.findIndex((meal) => meal.id === mealId);
      if (idx === -1) return current;
      const source = current.meals[idx];
      const clone: DietV2Meal = {
        ...source,
        id: makeLocalId("meal"),
        name: `${source.name} (העתק)`,
        categories: source.categories.map((category) => ({
          ...category,
          options: category.options.map((option) => ({
            ...option,
            id: makeLocalId("option"),
          })),
        })),
      };
      const next = [...current.meals];
      next.splice(idx + 1, 0, clone);
      return { ...current, meals: next };
    });
  };

  const removeMeal = (mealId: string) => {
    mutatePlan((current) => ({
      ...current,
      meals: current.meals.filter((meal) => meal.id !== mealId),
    }));
  };

  const addMeal = () => {
    mutatePlan((current) => ({
      ...current,
      meals: [...current.meals, buildEmptyMeal(current.meals.length + 1)],
    }));
  };

  const toggleCollapse = (mealId: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(mealId)) next.delete(mealId);
      else next.add(mealId);
      return next;
    });
  };

  const allCollapsed = plan.meals.length > 0 && plan.meals.every((m) => collapsedIds.has(m.id));
  const toggleAll = () => {
    setCollapsedIds(allCollapsed ? new Set() : new Set(plan.meals.map((m) => m.id)));
  };

  // Drag-and-drop reorder. We track a separate `dropIndex` so the
  // target card gets a highlight ring while hovered; on drop we
  // splice the dragged meal into the target position.
  const onMealDragStart = (idx: number) => {
    setDragIndex(idx);
    setDropIndex(idx);
  };
  const onMealDragOver = (idx: number, e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null) return;
    if (dropIndex !== idx) setDropIndex(idx);
  };
  const onMealDrop = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null);
      setDropIndex(null);
      return;
    }
    mutatePlan((current) => {
      const next = [...current.meals];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(idx, 0, moved);
      return { ...current, meals: next };
    });
    setDragIndex(null);
    setDropIndex(null);
  };

  // Daily totals respect each meal's macro mode: in manual mode we
  // use the trainer-typed values, otherwise we sum the category
  // averages. Mixed plans (some manual + some auto) are fine.
  const sumMealMacro = (key: keyof DietV2OptionMacros) =>
    plan.meals.reduce((acc, meal) => {
      if (meal.macroMode === "manual" && meal.manualMacros) {
        return acc + (meal.manualMacros[key] || 0);
      }
      return acc + computeMealAverage(meal, key);
    }, 0);

  const totals = useMemo(
    () => ({
      calories: Math.round(sumMealMacro("calories")),
      protein: Math.round(sumMealMacro("protein")),
      carbs: Math.round(sumMealMacro("carbs")),
      fat: Math.round(sumMealMacro("fat")),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plan.meals],
  );

  const highlightsCount = plan.highlights.trim() ? plan.highlights.trim().split(/\n+/).length : 0;
  const supplementsCount = plan.supplements.trim()
    ? plan.supplements.trim().split(/\n+/).length
    : 0;

  /**
   * Auto-fill: distribute a daily calorie & protein target across
   * the existing meals. Uses a typical 25/35/10/30 split for 4
   * meals, equal split otherwise. Macros allocate ~30% kcal from
   * protein, ~45% carbs, ~25% fat. Each meal flips to manual mode
   * so the trainer can fine-tune afterwards.
   */
  const applyAutoFill = (
    dailyCalories: number,
    dailyProtein: number,
    perMealPercents: number[]
  ) => {
    mutatePlan((current) => {
      const n = current.meals.length;
      if (n === 0) return current;
      const updated = current.meals.map((meal, idx) => {
        const ratio = (perMealPercents[idx] ?? 0) / 100;
        const cal = Math.round(dailyCalories * ratio);
        const proteinG = Math.round(dailyProtein * ratio);
        const proteinCal = proteinG * 4;
        const remainingCal = Math.max(0, cal - proteinCal);
        const carbsG = Math.round((remainingCal * 0.6) / 4);
        const fatG = Math.round((remainingCal * 0.4) / 9);
        return {
          ...meal,
          macroMode: "manual" as const,
          manualMacros: {
            protein: proteinG,
            carbs: carbsG,
            fat: fatG,
            calories: cal,
          },
        };
      });
      return { ...current, meals: updated };
    });
    setAutoFillOpen(false);
  };

  return (
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
      {/* 3-card summary strip (meal count moved next to the add-meal
          button below; the trainer doesn't need it at hero level). */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<FaWeightScale size={14} />}
          label="חלבון · פחמ׳ · שומן"
          value={`${totals.protein} · ${totals.carbs} · ${totals.fat}`}
        />
        <SummaryCard
          icon={<FaFire size={14} />}
          label="סך קלוריות"
          value={`${totals.calories} קק״ל`}
        />
        <SummaryCard
          icon={<FaClipboardCheck size={14} />}
          label="דגשים · תוספים"
          value={
            highlightsCount + supplementsCount === 0
              ? "—·—"
              : `${highlightsCount} · ${supplementsCount}`
          }
        />
      </div>

      {/* Toolbar — tabs + global actions (load template, auto-fill,
          collapse-all, save indicator). Replaces the heavy "טען
          תבנית קיימת" panel. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav className="flex items-center gap-2">
          <TabButton
            active={tab === "menu"}
            icon={<FaApple size={11} />}
            label="תפריט"
            onClick={() => setTab("menu")}
            primary
          />
          <TabButton
            active={tab === "highlights"}
            icon={<FaClipboardCheck size={11} />}
            label={`דגשים${highlightsCount ? ` · ${highlightsCount}` : ""}`}
            onClick={() => setTab("highlights")}
          />
          <TabButton
            active={tab === "supplements"}
            icon={<FaPlus size={11} />}
            label={`תוספים${supplementsCount ? ` · ${supplementsCount}` : ""}`}
            onClick={() => setTab("supplements")}
          />
        </nav>

        <div className="flex flex-wrap items-center gap-1.5">
          <SaveIndicator saved={saved} />
          <ToolbarButton
            icon={<FaFloppyDisk size={11} />}
            label={saved ? "נשמר" : "שמור תפריט"}
            onClick={handleSave}
            disabled={saved}
            tone="brand"
          />
          {tab === "menu" && (
            <>
              <ToolbarButton
                icon={<FaWandMagicSparkles size={11} />}
                label="מלא אוטומטית"
                onClick={() => setAutoFillOpen(true)}
              />
              {plan.meals.length > 1 && (
                <ToolbarButton
                  icon={allCollapsed ? <FaExpand size={11} /> : <FaCompress size={11} />}
                  label={allCollapsed ? "פתח הכל" : "סגור הכל"}
                  onClick={toggleAll}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Tab content */}
      {tab === "menu" && (
        <>
          {autoFillOpen && (
            <AutoFillPanel
              defaultCalories={totals.calories || 2200}
              defaultProtein={totals.protein || 180}
              mealsCount={plan.meals.length}
              mealNames={plan.meals.map((m, i) => m.name || `ארוחה ${i + 1}`)}
              onCancel={() => setAutoFillOpen(false)}
              onApply={applyAutoFill}
            />
          )}

          <div className="flex flex-col gap-4">
            {plan.meals.map((meal, idx) => (
              <MealCard
                key={meal.id}
                meal={meal}
                index={idx + 1}
                collapsed={collapsedIds.has(meal.id)}
                onChange={(next) => updateMeal(meal.id, () => next)}
                onToggleCollapse={() => toggleCollapse(meal.id)}
                onDuplicate={() => duplicateMeal(meal.id)}
                onRemove={() => removeMeal(meal.id)}
                onDragStart={() => onMealDragStart(idx)}
                onDragOver={(e) => onMealDragOver(idx, e)}
                onDrop={() => onMealDrop(idx)}
                isDragging={dragIndex === idx}
                isDropTarget={dropIndex === idx && dragIndex !== null && dragIndex !== idx}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addMeal}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/40 px-5 py-4 text-sm font-bold text-blue-700 transition-all hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300"
          >
            <FaPlus size={12} />
            הוסף ארוחה
            <span className="text-[11px] font-normal text-blue-500/80 dark:text-blue-400/70">
              · {plan.meals.length} כרגע
            </span>
          </button>
        </>
      )}

      {tab === "highlights" && (
        <NotesPanel
          title="דגשים לתפריט"
          hint="הנחיות כלליות שיוצגו למתאמן (שורה לכל דגש)"
          value={plan.highlights}
          onChange={(highlights) => mutatePlan((p) => ({ ...p, highlights }))}
          placeholder={"שתה 3 ליטר מים ביום\nהפסקה של 4 שעות בין ארוחות\n..."}
        />
      )}

      {tab === "supplements" && (
        <NotesPanel
          title="תוספים"
          hint="רשימת תוספי תזונה ומינונים (שורה לכל תוסף)"
          value={plan.supplements}
          onChange={(supplements) => mutatePlan((p) => ({ ...p, supplements }))}
          placeholder={"חלבון מי גבינה — 30 גרם אחרי אימון\nקריאטין — 5 גרם ביום\n..."}
        />
      )}
    </div>
  );
};

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
    <div className="flex flex-col">
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
      <strong className="mt-0.5 text-base font-extrabold text-slate-900 dark:text-slate-100">
        {value}
      </strong>
    </div>
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
      {icon}
    </span>
  </div>
);

interface TabButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ active, icon, label, onClick, primary }) => {
  const activeClass = primary
    ? "brand-gradient text-white shadow-md shadow-blue-500/25"
    : "bg-emerald-600 text-white shadow-md shadow-emerald-500/25";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all hover:-translate-y-0.5 ${
        active
          ? `${activeClass} border-transparent`
          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  tone?: "default" | "brand";
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, label, onClick, disabled, title, tone }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${
      tone === "brand"
        ? "border-blue-300 bg-blue-600 text-white shadow-sm shadow-blue-500/30 hover:bg-blue-700"
        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    }`}
  >
    {icon}
    {label}
  </button>
);

const SaveIndicator: React.FC<{ saved: boolean }> = ({ saved }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold transition-colors ${
      saved
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
        : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
    }`}
    title={saved ? "כל השינויים נשמרו מקומית" : "שומר…"}
  >
    {saved ? <FaCheck size={9} /> : <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />}
    {saved ? "נשמר" : "שומר…"}
  </span>
);

interface NotesPanelProps {
  title: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ title, hint, value, onChange, placeholder }) => (
  <section className="rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900/40 dark:bg-slate-900">
    <header className="mb-2 flex items-baseline justify-between gap-2">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <span className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</span>
    </header>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={8}
      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    />
  </section>
);

interface AutoFillPanelProps {
  defaultCalories: number;
  defaultProtein: number;
  mealsCount: number;
  mealNames: string[];
  onApply: (calories: number, protein: number, perMealPercents: number[]) => void;
  onCancel: () => void;
}

/**
 * Inline panel for the "מלא אוטומטית" action. The trainer types
 * the daily targets AND edits the per-meal % split before applying.
 * No trainer trusts a hard-coded 25/35/10/30, so the split needs to
 * be visible and editable. The panel seeds with a suggested split
 * that the trainer can override.
 */
const AutoFillPanel: React.FC<AutoFillPanelProps> = ({
  defaultCalories,
  defaultProtein,
  mealsCount,
  mealNames,
  onApply,
  onCancel,
}) => {
  const [calories, setCalories] = useState(defaultCalories);
  const [protein, setProtein] = useState(defaultProtein);
  const [percents, setPercents] = useState<number[]>(() =>
    autoSplit(mealsCount).map((r) => Math.round(r * 100))
  );

  const total = percents.reduce((sum, p) => sum + p, 0);
  const isValid = calories > 0 && mealsCount > 0 && total === 100;

  const updatePercent = (idx: number, value: number) => {
    setPercents((prev) => prev.map((p, i) => (i === idx ? Math.max(0, value) : p)));
  };

  return (
    <section className="rounded-2xl border border-blue-200 bg-gradient-to-l from-blue-50 to-white p-4 shadow-sm dark:border-blue-900/40 dark:from-blue-950/30 dark:to-slate-900">
      <header className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
          <FaWandMagicSparkles size={12} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">מילוי אוטומטי</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            הגדר יעד יומי + חלוקת אחוזים בין {mealsCount} הארוחות
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NumberField label="קלוריות ביום" value={calories} onChange={setCalories} suffix="קק״ל" />
        <NumberField label="חלבון ביום" value={protein} onChange={setProtein} suffix="גרם" />
      </div>

      <div className="mt-3 rounded-xl border border-blue-100 bg-white p-3 dark:border-blue-900/40 dark:bg-slate-900/60">
        <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-600 dark:text-slate-300">חלוקה בין ארוחות</span>
          <span className={total === 100 ? "text-emerald-600" : "text-rose-600"}>
            סה״כ: {total}%
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {percents.map((p, idx) => (
            <label key={idx} className="flex items-center gap-2 text-[11px]">
              <span className="w-24 shrink-0 truncate text-slate-600 dark:text-slate-300">
                {mealNames[idx] || `ארוחה ${idx + 1}`}
              </span>
              <span className="inline-flex flex-1 items-stretch overflow-hidden rounded-md border border-blue-200 bg-white dark:border-blue-900/40 dark:bg-slate-900">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  value={p || ""}
                  onChange={(e) => updatePercent(idx, Number(e.target.value) || 0)}
                  className="w-full border-0 bg-transparent px-2 py-1 text-center text-xs font-extrabold text-slate-800 focus:outline-none dark:text-slate-100"
                />
                <span className="flex items-center bg-blue-50 px-2 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  %
                </span>
              </span>
            </label>
          ))}
        </div>
        {total !== 100 && (
          <p className="mt-2 text-[10px] font-semibold text-rose-600">
            סכום האחוזים חייב להיות 100% כדי לחלק
          </p>
        )}
      </div>

      <footer className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ביטול
        </button>
        <button
          type="button"
          onClick={() => onApply(calories, protein, percents)}
          disabled={!isValid}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-blue-500/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <FaWandMagicSparkles size={10} />
          חלק אוטומטית
        </button>
      </footer>
    </section>
  );
};

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix: string;
}> = ({ label, value, onChange, suffix }) => (
  <label className="flex flex-col gap-1 text-right">
    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{label}</span>
    <span className="inline-flex items-stretch overflow-hidden rounded-lg border border-blue-200 bg-white shadow-inner dark:border-blue-900/40 dark:bg-slate-900">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-full border-0 bg-transparent px-3 py-2 text-sm font-extrabold text-slate-800 focus:outline-none dark:text-slate-100"
      />
      <span className="flex items-center bg-blue-50 px-2 text-[11px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
        {suffix}
      </span>
    </span>
  </label>
);

/**
 * Typical kcal split for N meals. For 4 meals we lean on the
 * classic breakfast-lunch-snack-dinner shape; everything else just
 * splits evenly. The ratios always sum to 1.
 */
const autoSplit = (n: number): number[] => {
  if (n === 4) return [0.25, 0.35, 0.1, 0.3];
  if (n === 5) return [0.22, 0.3, 0.1, 0.28, 0.1];
  if (n === 3) return [0.3, 0.4, 0.3];
  return Array.from({ length: n }, () => 1 / n);
};

export default DietPlanV2Editor;
