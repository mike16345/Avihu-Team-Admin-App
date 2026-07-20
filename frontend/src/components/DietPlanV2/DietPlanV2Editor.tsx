import { useEffect, useMemo, useState } from "react";
import {
  FaApple,
  FaBookmark,
  FaClipboardCheck,
  FaFloppyDisk,
  FaPlus,
} from "react-icons/fa6";

import type { DietV2Meal, DietV2OptionMacros, DietV2Plan } from "@/interfaces/IDietPlanV2";

import {
  buildEmptyMeal,
  computeMealAverage,
  makeLocalId,
} from "./dietPlanV2Utils";
import MealCard from "./MealCard";
import PlanMacroCharts from "./PlanMacroCharts";
import DietPlanV2TemplateSaveDialog from "./DietPlanV2TemplateSaveDialog";
import DietPlanV2TemplatePickerDialog from "./DietPlanV2TemplatePickerDialog";
import SupplementsPanel from "./SupplementsPanel";
import NotesPanel from "./NotesPanel";
import { SaveIndicator, TabButton, ToolbarButton } from "./DietPlanV2Toolbar";
import type { DietV2Template } from "./dietPlanV2Templates";
import { normaliseSupplements, type DietV2Supplement } from "./dietPlanV2Supplements";
import { useUsersStore } from "@/store/userStore";

type DietV2Tab = "menu" | "highlights" | "supplements" | "freeCalories";

interface DietV2PlanExtended extends DietV2Plan {
  highlights: string;
  supplements: DietV2Supplement[];
}

export type DietV2EditorMode = "trainee" | "template";

interface DietV2EditorProps {
  initialPlan?: DietV2PlanExtended;
  onPersist?: (plan: DietV2PlanExtended) => void;
  mode?: DietV2EditorMode;
  saveLabel?: string;
  forceDirty?: boolean;
}

const DRAFT_STORAGE_KEY = "dietPlanV2:draft";

const buildInitialPlan = (): DietV2PlanExtended => {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.meals?.length) {
          return {
            meals: parsed.meals,
            highlights: typeof parsed.highlights === "string" ? parsed.highlights : "",
            supplements: normaliseSupplements(parsed.supplements),
          };
        }
      }
    } catch {
    }
  }
  return {
    meals: [buildEmptyMeal(1)],
    highlights: "",
    supplements: [],
  };
};

const DietPlanV2Editor: React.FC<DietV2EditorProps> = ({
  initialPlan,
  onPersist,
  mode = "trainee",
  saveLabel,
  forceDirty = false,
}) => {
  const isTemplateMode = mode === "template";
  const [plan, setPlan] = useState<DietV2PlanExtended>(
    () => initialPlan ?? buildInitialPlan()
  );
  const [tab, setTab] = useState<DietV2Tab>("menu");
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(plan.meals.map((m) => m.id))
  );
  const mealIdKey = plan.meals.map((m) => m.id).join(",");
  useEffect(() => {
    setCollapsedIds((prev) => {
      const current = new Set(plan.meals.map((m) => m.id));
      const next = new Set<string>();
      prev.forEach((id) => {
        if (current.has(id)) next.add(id);
      });
      plan.meals.forEach((m) => {
        if (!prev.has(m.id)) next.add(m.id);
      });
      return next;
    });
  }, [mealIdKey]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [saved, setSaved] = useState(true);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [highlightsWarningKey, setHighlightsWarningKey] = useState(0);
  const [highlightsAttentionActive, setHighlightsAttentionActive] = useState(false);
  useEffect(() => {
    if (highlightsWarningKey === 0) return;
    setHighlightsAttentionActive(true);
    const timeout = window.setTimeout(() => setHighlightsAttentionActive(false), 1000);
    return () => window.clearTimeout(timeout);
  }, [highlightsWarningKey]);
  const currentTrainerName = useUsersStore((s) => {
    const u = s.currentUser;
    if (!u) return "";
    return [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  });

  const markEdited = () => {
    setSaved(false);
  };

  const guardHighlights = (): boolean => {
    if (plan.highlights.trim().length > 0) return true;
    setHighlightsWarningKey((k) => k + 1);
    return false;
  };

  const handleSave = () => {
    if (!isTemplateMode && !guardHighlights()) return;
    setSaved(true);
    if (onPersist) {
      onPersist(plan);
      return;
    }
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(plan));
      } catch {
      }
    }
  };

  const handleSaveAsTemplate = () => {
    if (!guardHighlights()) return;
    setTemplateDialogOpen(true);
  };

  const handleApplyTemplate = (template: DietV2Template) => {
    const clonedPlan: DietV2PlanExtended = {
      meals: template.plan.meals.map((meal) => ({
        ...meal,
        id: makeLocalId("meal"),
        categories: meal.categories.map((cat) => ({
          ...cat,
          options: cat.options.map((opt) => ({ ...opt, id: makeLocalId("option") })),
        })),
      })),
      highlights:
        (template.plan as Partial<DietV2PlanExtended>).highlights ?? plan.highlights,
      supplements: normaliseSupplements(
        (template.plan as Partial<DietV2PlanExtended>).supplements
      ).map((s) => ({ ...s, id: makeLocalId("supp") })),
    };
    setPlan(clonedPlan);
    markEdited();
    setTemplatePickerOpen(false);
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

  const copyCategoryToMeal = (
    sourceMealId: string,
    categoryKind: DietV2Meal["categories"][number]["kind"],
    targetMealId: string
  ) => {
    if (sourceMealId === targetMealId) return;
    mutatePlan((current) => {
      const source = current.meals.find((m) => m.id === sourceMealId);
      const sourceCategory = source?.categories.find((c) => c.kind === categoryKind);
      if (!sourceCategory || sourceCategory.options.length === 0) return current;
      const clonedOptions = sourceCategory.options.map((option) => ({
        ...option,
        id: makeLocalId("option"),
      }));
      return {
        ...current,
        meals: current.meals.map((meal) => {
          if (meal.id !== targetMealId) return meal;
          return {
            ...meal,
            categories: meal.categories.map((cat) =>
              cat.kind === categoryKind
                ? { ...cat, options: [...cat.options, ...clonedOptions] }
                : cat
            ),
          };
        }),
      };
    });
  };

  const copyCategoryToNewMeal = (
    sourceMealId: string,
    categoryKind: DietV2Meal["categories"][number]["kind"]
  ) => {
    mutatePlan((current) => {
      const source = current.meals.find((m) => m.id === sourceMealId);
      const sourceCategory = source?.categories.find((c) => c.kind === categoryKind);
      if (!sourceCategory || sourceCategory.options.length === 0) return current;
      const newMeal = buildEmptyMeal(current.meals.length + 1);
      const clonedOptions = sourceCategory.options.map((option) => ({
        ...option,
        id: makeLocalId("option"),
      }));
      const seeded: DietV2Meal = {
        ...newMeal,
        categories: newMeal.categories.map((cat) =>
          cat.kind === categoryKind ? { ...cat, options: clonedOptions } : cat
        ),
      };
      return { ...current, meals: [...current.meals, seeded] };
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
    [plan.meals],
  );

  const supplementsCount = plan.supplements.length;
  const showSaved = saved && !forceDirty;

  return (
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
      {/* Macro overview graphs — daily calorie hero + macro-ratio
          donut. Placed above the small summary strip so the trainer
          sees the plan's shape (calorie total + energy split) first,
          then the compact stats below. */}
      <PlanMacroCharts totals={totals} />

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
          />
          <TabButton
            key={`highlights-tab-${highlightsWarningKey}`}
            active={tab === "highlights"}
            icon={<FaClipboardCheck size={11} />}
            label="דגשים"
            onClick={() => setTab("highlights")}
            attention={highlightsAttentionActive}
          />
          <TabButton
            active={tab === "supplements"}
            icon={<FaPlus size={11} />}
            label={`תוספים${supplementsCount ? ` · ${supplementsCount}` : ""}`}
            onClick={() => setTab("supplements")}
          />
          <FreeCaloriesInput
            active={tab === "freeCalories"}
            onActivate={() => setTab("freeCalories")}
            value={plan.freeCalories ?? 0}
            onChange={(v) =>
              setPlan((current) => ({
                ...current,
                freeCalories: v > 0 ? v : undefined,
              }))
            }
          />
        </nav>

        <div className="flex flex-wrap items-center gap-1.5">
          <SaveIndicator saved={saved} />
          <ToolbarButton
            icon={<FaFloppyDisk size={11} />}
            label={showSaved ? "נשמר" : saveLabel ?? "שמור תפריט"}
            onClick={handleSave}
            disabled={showSaved}
            tone="brand"
          />
          {!isTemplateMode && (
            <>
              <ToolbarButton
                icon={<FaBookmark size={11} />}
                label="שמור כתבנית"
                onClick={handleSaveAsTemplate}
                disabled={plan.meals.every((m) => m.categories.every((c) => c.options.length === 0))}
              />
              <ToolbarButton
                icon={<FaClipboardCheck size={11} />}
                label="תבניות"
                onClick={() => setTemplatePickerOpen(true)}
              />
            </>
          )}
        </div>
      </div>

      {/* Tab content */}
      {(tab === "menu" || tab === "freeCalories") && (
        <>
          <div className="flex flex-col gap-4">
            {plan.meals.map((meal, idx) => (
              <MealCard
                key={meal.id}
                meal={meal}
                index={idx + 1}
                collapsed={collapsedIds.has(meal.id)}
                siblingMeals={plan.meals
                  .filter((m) => m.id !== meal.id)
                  .map((m) => ({
                    id: m.id,
                    name: m.name || `ארוחה ${plan.meals.indexOf(m) + 1}`,
                    index: plan.meals.indexOf(m) + 1,
                  }))}
                onCopyCategoryToMeal={(kind, targetId) =>
                  copyCategoryToMeal(meal.id, kind, targetId)
                }
                onCopyCategoryToNewMeal={(kind) =>
                  copyCategoryToNewMeal(meal.id, kind)
                }
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
        <SupplementsPanel
          items={plan.supplements}
          onAdd={(name, doseAmount, doseUnit) =>
            mutatePlan((p) => ({
              ...p,
              supplements: [
                ...p.supplements,
                { id: makeLocalId("supp"), name, doseAmount, doseUnit },
              ],
            }))
          }
          onUpdate={(id, patch) =>
            mutatePlan((p) => ({
              ...p,
              supplements: p.supplements.map((s) => (s.id === id ? { ...s, ...patch } : s)),
            }))
          }
          onRemove={(id) =>
            mutatePlan((p) => ({
              ...p,
              supplements: p.supplements.filter((s) => s.id !== id),
            }))
          }
        />
      )}

      <DietPlanV2TemplateSaveDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        plan={plan}
        defaultBuiltBy={currentTrainerName}
      />

      <DietPlanV2TemplatePickerDialog
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        onApply={handleApplyTemplate}
      />
    </div>
  );
};

const FreeCaloriesInput: React.FC<{
  active: boolean;
  onActivate: () => void;
  value: number;
  onChange: (next: number) => void;
}> = ({ active, onActivate, value, onChange }) => (
  <label
    onClick={onActivate}
    title="כמות קק״ל שמעבר לתפריט המובנה — לשימוש חופשי של המתאמן"
    className={`inline-flex items-center rounded-xl border border-blue-700 bg-white font-bold text-blue-700 transition-all dark:border-blue-500 dark:bg-slate-900 dark:text-blue-200 ${
      active
        ? "gap-1.5 px-3.5 py-2 text-[13px]"
        : "gap-1.5 px-3 py-2 text-xs"
    }`}
  >
    <span>קלוריות חופשיות</span>
    <input
      type="number"
      inputMode="numeric"
      min={0}
      value={value || ""}
      onFocus={onActivate}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      placeholder="0"
      className={`border-0 bg-transparent p-0 text-center font-extrabold text-slate-900 focus:outline-none focus:ring-0 dark:text-slate-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
        active ? "w-12 text-[13px]" : "w-10 text-xs"
      }`}
    />
    <span className={active ? "text-[11px] font-semibold text-slate-400" : "text-[10px] font-semibold text-slate-400"}>
      קק״ל
    </span>
  </label>
);

export default DietPlanV2Editor;
