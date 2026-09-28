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
  /** Seed plan (skips localStorage draft hydration). When absent,
   *  the editor hydrates from the trainee draft as before. */
  initialPlan?: DietV2PlanExtended;
  /** Called instead of writing the trainee draft — used by the
   *  template editor to upsert into `dietPlanV2:templates`. */
  onPersist?: (plan: DietV2PlanExtended) => void;
  /** "template" hides the save-as-template / load-template controls
   *  and renames the primary save button. Defaults to "trainee". */
  mode?: DietV2EditorMode;
  /** Label shown in the primary save button. Falls back to the
   *  built-in trainee-mode text. */
  saveLabel?: string;
  /** External "unsaved changes" signal — lets a parent (e.g. the
   *  template editor, whose metadata lives outside this component)
   *  keep the save button active even when the meals themselves
   *  haven't changed. */
  forceDirty?: boolean;
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
      /* ignore parse errors — start fresh */
    }
  }
  return {
    meals: [buildEmptyMeal(1)],
    highlights: "",
    supplements: [],
  };
};

/**
 * Top-level editor for the v2 ("options") diet plan layout.
 * Local state for now — when the API is wired this becomes the
 * consumer of a query/mutation hook pair (per Agents.md three-step
 * data flow).
 */
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
  // Collapsed meal IDs live in the editor so a single "collapse
  // all" button can flip everyone at once and each card stays in
  // sync. Defaults to ALL meals collapsed on first render — the
  // trainer opens whichever meal they intend to edit. New meals
  // added later also join the collapsed set (see `addMeal`).
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(plan.meals.map((m) => m.id))
  );
  // Any meal that appears AFTER first render (duplicate, add, or a
  // copy-to-new-meal from a category) joins the collapsed set — same
  // "starts folded until you open it" contract. Removed meal IDs are
  // pruned so the set doesn't grow unboundedly. Effect runs on the
  // id-list, not the full plan, so unrelated edits don't retrigger.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealIdKey]);
  // Drag-and-drop state for native HTML5 reorder.
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  // Cosmetic "saved" indicator — flips to "saving" on every edit
  // and clears 800ms later. Real persistence will replace the
  // setTimeout when the mutation hook is wired.
  const [saved, setSaved] = useState(true);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  // Bumped each time the trainer tries to save without highlights;
  // drives a brief "attention" flash on the דגשים tab. The key stays
  // monotonic so useEffect fires even on the SAME failed error twice
  // in a row (unchanged value would be skipped).
  const [highlightsWarningKey, setHighlightsWarningKey] = useState(0);
  // Transient flag: true for ~1 second after each failed save attempt,
  // then auto-clears. The tab shows the red-shake state only while
  // this flag is on — so the red visibly comes from the LAST CLICK,
  // not from a persistent "you still don't have highlights" nag.
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

  /**
   * A plan must carry at least one line of "דגשים" (highlights)
   * before it can be saved or turned into a template — highlights
   * are how the trainer flags what's important about this menu for
   * the trainee (allergies, timing, coach notes). Returns true when
   * the plan is OK to save; when it isn't we bump the warning key so
   * the banner re-animates.
   */
  const guardHighlights = (): boolean => {
    if (plan.highlights.trim().length > 0) return true;
    setHighlightsWarningKey((k) => k + 1);
    return false;
  };

  // Save handler — right now this is client-side only because
  // the v2 backend endpoint isn't wired. Once `PUT /diet-plans/:id`
  // exists, swap this for a real mutation hook. The button + dirty
  // indicator is here so trainers stop losing plans to refresh.
  const handleSave = () => {
    // Templates don't carry trainee-facing דגשים, so don't gate their
    // save on the highlights guard the trainee flow enforces.
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
        /* storage unavailable — best effort */
      }
    }
  };

  /**
   * Opens the save-as-template dialog. The dialog collects metadata
   * (name, macros — auto-seeded but editable, allergies, built-by)
   * and writes the result to `dietPlanV2:templates` in localStorage.
   *
   * TODO(Michael): wire the dialog's `upsertTemplate` call to a real
   * `POST /diet-plan-v2/templates` endpoint so templates sync across
   * devices and appear on the shared templates page.
   */
  const handleSaveAsTemplate = () => {
    if (!guardHighlights()) return;
    setTemplateDialogOpen(true);
  };

  /**
   * Load a saved template into the current editor. The template is
   * cloned with fresh ids so editing the loaded plan doesn't mutate
   * the stored template. All extras — highlights, supplements —
   * ride along; the trainer can immediately save the loaded state
   * as this trainee's plan.
   */
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

  /**
   * Copy every option in a source meal's category into the target
   * meal's same category. Options are cloned with fresh ids and
   * APPENDED to the target — never destructive; the target's
   * existing options are preserved.
   */
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

  /**
   * Create a new empty meal AND copy the source category's options
   * into it in one shot. Lets the trainer say "copy this protein
   * block into a new meal" without a two-step add-then-copy.
   */
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

  const supplementsCount = plan.supplements.length;
  // The button reads "saved" only when the meals are clean AND the
  // parent reports no external (metadata) changes.
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
            // Re-mount on every failed save attempt so the shake
            // animation restarts each time — a single incrementing
            // counter is enough to force React to reconcile fresh.
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


/**
 * Numeric "free calories" chip in the tabs row — trainer types how
 * many kcal the trainee can spend outside the planned menu. Empty
 * or 0 clears the value; persistence rides along the plan draft.
 */
/**
 * Numeric "free calories" chip that participates in the tabs row's
 * grow-on-active behaviour: when it's the selected control the chip
 * scales up to match an active tab; otherwise it renders at the
 * compact size of the idle tabs. Clicking anywhere on the label or
 * focusing the input marks it active.
 */
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
