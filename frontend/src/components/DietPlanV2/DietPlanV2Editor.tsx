import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { FaApple, FaBookmark, FaClipboardCheck, FaFloppyDisk, FaPlus } from "react-icons/fa6";
import { toast } from "sonner";

import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import type { DietV2Meal, DietV2MealCategory, IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import { dietPlanV2Schema } from "@/schemas/dietPlanV2Schema";
import { useUsersStore } from "@/store/userStore";

import DietPlanV2TemplatePickerDialog from "./DietPlanV2TemplatePickerDialog";
import DietPlanV2TemplateSaveDialog from "./DietPlanV2TemplateSaveDialog";
import { TabButton, ToolbarButton } from "./DietPlanV2Toolbar";
import MealCard from "./MealCard";
import NotesPanel from "./NotesPanel";
import PlanMacroCharts from "./PlanMacroCharts";
import { hasCategoryDuplicate } from "./dietPlanV2Catalog";
import type { DietV2Template } from "./dietPlanV2Templates";
import { buildEmptyMeal, computePlanMacroTotals, makeLocalId } from "./dietPlanV2Utils";

type DietV2Tab = "menu" | "highlights";

export type DietV2EditorMode = "trainee" | "template";

interface DietV2EditorProps {
  initialPlan?: IDietPlanV2;
  onPersist?: (plan: IDietPlanV2) => Promise<IDietPlanV2 | void> | IDietPlanV2 | void;
  mode?: DietV2EditorMode;
  saveLabel?: string;
  forceDirty?: boolean;
}

const DRAFT_STORAGE_KEY = "dietPlanV2:draft";

const createEmptyPlan = (): IDietPlanV2 => ({
  version: 2,
  meals: [buildEmptyMeal(1)],
  highlights: "",
});

const readInitialPlan = (initialPlan?: IDietPlanV2): IDietPlanV2 => {
  if (initialPlan) return initialPlan;
  if (typeof window === "undefined") return createEmptyPlan();

  try {
    const parsed = JSON.parse(window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? "null");
    const result = dietPlanV2Schema.safeParse(parsed);
    if (result.success) return result.data;
  } catch {
    return createEmptyPlan();
  }

  return createEmptyPlan();
};

const cloneMeal = (meal: DietV2Meal): DietV2Meal => ({
  ...meal,
  id: makeLocalId("meal"),
  name: `${meal.name} (העתק)`,
  categories: meal.categories.map((category) => ({
    ...category,
    items: category.items.map((item) => ({ ...item })),
  })),
  macros: { ...meal.macros },
  freeCalories: meal.freeCalories ? { ...meal.freeCalories } : undefined,
  supplements: meal.supplements ? [...meal.supplements] : undefined,
});

const DietPlanV2Editor: React.FC<DietV2EditorProps> = ({
  initialPlan,
  onPersist,
  mode = "trainee",
  saveLabel,
  forceDirty = false,
}) => {
  const isTemplateMode = mode === "template";
  const form = useForm<IDietPlanV2>({
    resolver: zodResolver(dietPlanV2Schema),
    defaultValues: readInitialPlan(initialPlan),
  });
  const { control, handleSubmit, reset, setValue, watch } = form;
  const { append, insert, move, remove } = useFieldArray({ control, name: "meals" });
  const plan = watch();
  const { isDirty, isSubmitting } = form.formState;

  const [tab, setTab] = useState<DietV2Tab>("menu");
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(plan.meals.slice(1).map((meal) => meal.id))
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const currentTrainerName = useUsersStore((state) => {
    const user = state.currentUser;
    if (!user) return "";

    return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  });

  const totals = useMemo(() => computePlanMacroTotals(plan), [plan]);
  const hasPlanItems = plan.meals.some((meal) =>
    meal.categories.some((category) => category.items.length > 0)
  );
  const saveDisabled = (!isDirty && !forceDirty) || isSubmitting;
  let saveButtonLabel = saveLabel ?? "שמור תפריט";
  if (saveDisabled) saveButtonLabel = "נשמר";
  if (isSubmitting) saveButtonLabel = "שומר…";

  useUnsavedChangesWarning(isDirty || forceDirty);

  const updateMeal = (mealId: string, next: DietV2Meal) => {
    const mealIndex = plan.meals.findIndex((meal) => meal.id === mealId);
    if (mealIndex === -1) return;
    setValue(`meals.${mealIndex}`, next, { shouldDirty: true, shouldValidate: true });
  };

  const toggleCollapse = (mealId: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(mealId)) next.delete(mealId);
      else next.add(mealId);

      return next;
    });
  };

  const copyCategoryToMeal = (
    sourceMealId: string,
    categoryName: DietV2MealCategory,
    targetMealId: string
  ) => {
    const source = plan.meals.find((meal) => meal.id === sourceMealId);
    const targetIndex = plan.meals.findIndex((meal) => meal.id === targetMealId);
    const sourceCategory = source?.categories.find(
      (category) => category.category === categoryName
    );
    if (!sourceCategory || targetIndex === -1) return;

    const target = plan.meals[targetIndex];
    const targetCategory = target.categories.find(
      (category) => category.category === categoryName
    ) ?? { category: categoryName, items: [] };
    const items = [...targetCategory.items];
    sourceCategory.items.forEach((item) => {
      if (!hasCategoryDuplicate(items, item.name)) items.push({ ...item });
    });
    const categories = target.categories.some((category) => category.category === categoryName)
      ? target.categories.map((category) =>
          category.category === categoryName ? { ...category, items } : category
        )
      : [...target.categories, { category: categoryName, items }];

    setValue(`meals.${targetIndex}`, { ...target, categories }, { shouldDirty: true });
  };

  const copyCategoryToNewMeal = (sourceMealId: string, categoryName: DietV2MealCategory) => {
    const source = plan.meals.find((meal) => meal.id === sourceMealId);
    const sourceCategory = source?.categories.find(
      (category) => category.category === categoryName
    );
    if (!sourceCategory) return;

    const newMeal = buildEmptyMeal(plan.meals.length + 1);
    append({
      ...newMeal,
      categories: newMeal.categories.map((category) =>
        category.category === categoryName
          ? { ...category, items: sourceCategory.items.map((item) => ({ ...item })) }
          : category
      ),
    });
  };

  const handleApplyTemplate = (template: DietV2Template) => {
    const appliedPlan: IDietPlanV2 = {
      ...template.plan,
      _id: undefined,
      meals: template.plan.meals.map((meal) => ({ ...cloneMeal(meal), name: meal.name })),
    };
    reset(appliedPlan, { keepDefaultValues: true });
    setTemplatePickerOpen(false);
  };

  const persistPlan = handleSubmit(async (values) => {
    try {
      const persisted = await onPersist?.(values);
      const savedPlan = persisted ?? values;
      if (!onPersist) window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(savedPlan));
      reset(savedPlan);
      toast.success("התפריט נשמר בהצלחה");
    } catch {
      toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE);
    }
  });

  const handleMealDrop = (targetIndex: number) => {
    if (dragIndex !== null && dragIndex !== targetIndex) move(dragIndex, targetIndex);
    setDragIndex(null);
    setDropIndex(null);
  };

  return (
    <FormProvider {...form}>
      <div data-testid="diet-v2-editor" dir="rtl" className="flex flex-col gap-4 font-heebo">
        <PlanMacroCharts totals={totals.macros} freeCalories={totals.freeCalories} />

        <div className="my-4 h-px w-full bg-slate-200 dark:bg-slate-800" />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <nav className="flex items-center gap-2">
            <TabButton
              active={tab === "menu"}
              icon={<FaApple size={11} />}
              label="תפריט"
              onClick={() => setTab("menu")}
            />
            <TabButton
              active={tab === "highlights"}
              icon={<FaClipboardCheck size={11} />}
              label="דגשים"
              onClick={() => setTab("highlights")}
            />
          </nav>

          <div className="flex flex-wrap items-center gap-1.5">
            <ToolbarButton
              icon={<FaFloppyDisk size={11} />}
              label={saveButtonLabel}
              onClick={persistPlan}
              disabled={saveDisabled}
              tone="brand"
            />
            {!isTemplateMode && (
              <>
                <ToolbarButton
                  icon={<FaBookmark size={11} />}
                  label="שמור כתבנית"
                  onClick={() => setTemplateDialogOpen(true)}
                  disabled={!hasPlanItems}
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

        {tab === "menu" && (
          <>
            <div className="flex flex-col gap-4">
              {plan.meals.map((meal, index) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  index={index + 1}
                  collapsed={collapsedIds.has(meal.id)}
                  siblingMeals={plan.meals
                    .filter((candidate) => candidate.id !== meal.id)
                    .map((candidate, candidateIndex) => ({
                      id: candidate.id,
                      name: candidate.name || `ארוחה ${candidateIndex + 1}`,
                      index: candidateIndex + 1,
                    }))}
                  onCopyCategoryToMeal={(category, targetId) =>
                    copyCategoryToMeal(meal.id, category, targetId)
                  }
                  onCopyCategoryToNewMeal={(category) => copyCategoryToNewMeal(meal.id, category)}
                  onChange={(next) => updateMeal(meal.id, next)}
                  onToggleCollapse={() => toggleCollapse(meal.id)}
                  onDuplicate={() => insert(index + 1, cloneMeal(meal))}
                  onRemove={() => remove(index)}
                  canRemove={plan.meals.length > 1}
                  onDragStart={() => {
                    setDragIndex(index);
                    setDropIndex(index);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (dragIndex !== null) setDropIndex(index);
                  }}
                  onDrop={() => handleMealDrop(index)}
                  isDragging={dragIndex === index}
                  isDropTarget={dropIndex === index && dragIndex !== null && dragIndex !== index}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => append(buildEmptyMeal(plan.meals.length + 1))}
              className="flex items-center justify-center gap-2 rounded-2xl border border-blue-200/70 bg-blue-50/40 px-5 py-4 text-sm font-bold text-blue-700 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300"
            >
              <FaPlus size={12} />
              הוסף ארוחה
              <span className="text-[11px] font-normal text-blue-500/80">
                · {plan.meals.length} כרגע
              </span>
            </button>
          </>
        )}

        {tab === "highlights" && (
          <NotesPanel
            title="דגשים לתפריט"
            hint="הנחיות כלליות שיוצגו למתאמן"
            value={plan.highlights}
            onChange={(highlights) =>
              setValue("highlights", highlights, { shouldDirty: true, shouldValidate: true })
            }
            placeholder={"שתה 3 ליטר מים ביום\nהפסקה של 4 שעות בין ארוחות\n..."}
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
    </FormProvider>
  );
};

export default DietPlanV2Editor;
