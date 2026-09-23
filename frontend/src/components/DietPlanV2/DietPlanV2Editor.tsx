import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { FormProvider, useFieldArray, useForm, type FieldErrors } from "react-hook-form";
import {
  FaApple,
  FaBookmark,
  FaClipboardCheck,
  FaFloppyDisk,
  FaPlus,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { toast } from "sonner";

import { ERROR_MESSAGES } from "@/enums/ErrorMessages";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import type { DietV2Meal, DietV2MealCategory, IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import { dietPlanV2Schema } from "@/schemas/dietPlanV2Schema";

import DietPlanV2TemplatePickerDialog from "./DietPlanV2TemplatePickerDialog";
import DietPlanV2TemplateSaveDialog from "./DietPlanV2TemplateSaveDialog";
import { TabButton, ToolbarButton } from "./DietPlanV2Toolbar";
import MealCard from "./MealCard";
import NotesPanel from "./NotesPanel";
import PlanMacroCharts from "./PlanMacroCharts";
import { hasCategoryDuplicate } from "./dietPlanV2Catalog";
import type { DietV2Template } from "./dietPlanV2Templates";
import {
  buildEmptyMeal,
  computePlanMacroTotals,
  deriveMealMacros,
  normalizeDietPlanV2,
} from "./dietPlanV2Utils";

type DietV2Tab = "menu" | "highlights";

export type DietV2EditorMode = "trainee" | "template";

interface DietV2EditorProps {
  initialPlan?: IDietPlanV2;
  onPersist?: (plan: IDietPlanV2) => Promise<IDietPlanV2 | void> | IDietPlanV2 | void;
  mode?: DietV2EditorMode;
  saveLabel?: string;
  forceDirty?: boolean;
}

const createEmptyPlan = (): IDietPlanV2 => ({
  version: 2,
  meals: [buildEmptyMeal(1)],
  highlights: "",
});

const readInitialPlan = (initialPlan?: IDietPlanV2): IDietPlanV2 => {
  if (initialPlan) return normalizeDietPlanV2(initialPlan);

  return createEmptyPlan();
};

const cloneMeal = (meal: DietV2Meal): DietV2Meal => ({
  ...meal,
  _id: undefined,
  name: `${meal.name} (העתק)`,
  categories: meal.categories.map((category) => ({
    ...category,
    items: category.items.map((item) => ({ ...item })),
    macros: category.macros ? { ...category.macros } : undefined,
  })),
  addOns:
    meal.addOns && meal.addOns.length > 0 ? meal.addOns.map((item) => ({ ...item })) : undefined,
  macros: deriveMealMacros(meal),
  freeCalories: meal.freeCalories
    ? { ...meal.freeCalories, items: meal.freeCalories.items.map((item) => ({ ...item })) }
    : undefined,
  supplements: meal.supplements ? [...meal.supplements] : undefined,
});

const getMealRenderId = (meal: DietV2Meal, fieldId: string | undefined, index: number): string =>
  meal._id ?? fieldId ?? `unsaved-meal-${index}`;

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
  const { control, handleSubmit, reset, setValue, trigger, watch } = form;
  const { append, fields, insert, move, remove } = useFieldArray({ control, name: "meals" });
  const plan = watch();
  const { errors, isDirty, isSubmitting, submitCount } = form.formState;

  const [tab, setTab] = useState<DietV2Tab>("menu");
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set(plan.meals.map((meal, index) => getMealRenderId(meal, fields[index]?.id, index)))
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const totals = useMemo(() => computePlanMacroTotals(plan), [plan]);

  const hasPlanItems = plan.meals.some(
    (meal) =>
      meal.categories.some((category) => category.items.length > 0) ||
      (meal.addOns?.length ?? 0) > 0
  );
  const macroValidationMessages = getMacroValidationMessages(plan, errors);
  const saveDisabled = (!isDirty && !forceDirty) || isSubmitting;
  let saveButtonLabel = saveLabel ?? "שמור תפריט";

  if (saveDisabled) saveButtonLabel = "נשמר";

  if (isSubmitting) saveButtonLabel = "שומר…";

  useUnsavedChangesWarning(isDirty || forceDirty);

  const updateMeal = (mealIndex: number, next: DietV2Meal) => {
    setValue(`meals.${mealIndex}`, next, { shouldDirty: true, shouldValidate: true });
  };

  const findMealIndexByRenderId = (renderId: string) =>
    plan.meals.findIndex(
      (meal, index) => getMealRenderId(meal, fields[index]?.id, index) === renderId
    );

  const toggleCollapse = (mealId: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(mealId)) next.delete(mealId);
      else next.add(mealId);

      return next;
    });
  };

  const copyCategoryToMeal = (
    sourceMealIndex: number,
    categoryName: DietV2MealCategory,
    targetMealRenderId: string
  ) => {
    const source = plan.meals[sourceMealIndex];
    const targetIndex = findMealIndexByRenderId(targetMealRenderId);
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

    const targetWasEmpty = targetCategory.items.length === 0;
    const copiedMacros = targetWasEmpty
      ? sourceCategory.macros
        ? { ...sourceCategory.macros }
        : undefined
      : targetCategory.macros
        ? { ...targetCategory.macros }
        : undefined;
    const categories = target.categories.some((category) => category.category === categoryName)
      ? target.categories.map((category) =>
          category.category === categoryName
            ? { ...category, items, macros: copiedMacros }
            : category
        )
      : [...target.categories, { category: categoryName, items, macros: copiedMacros }];

    setValue(
      `meals.${targetIndex}`,
      { ...target, categories, macros: deriveMealMacros({ categories }) },
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const copyCategoryToNewMeal = (sourceMealIndex: number, categoryName: DietV2MealCategory) => {
    const source = plan.meals[sourceMealIndex];
    const sourceCategory = source?.categories.find(
      (category) => category.category === categoryName
    );
    if (!sourceCategory) return;

    const newMeal = buildEmptyMeal(plan.meals.length + 1);
    append({
      ...newMeal,
      categories: newMeal.categories.map((category) =>
        category.category === categoryName
          ? {
              ...category,
              items: sourceCategory.items.map((item) => ({ ...item })),
              macros: sourceCategory.macros ? { ...sourceCategory.macros } : undefined,
            }
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
    reset(normalizeDietPlanV2(appliedPlan), { keepDefaultValues: true });
    setCollapsedIds(new Set());
    setTemplatePickerOpen(false);
  };

  const handleOpenTemplateDialog = async () => {
    if (await trigger()) setTemplateDialogOpen(true);
  };

  const persistPlan = handleSubmit(
    async (values) => {
      try {
        const canonicalPlan = normalizeDietPlanV2(values);
        const persisted = await onPersist?.(canonicalPlan);
        const savedPlan = normalizeDietPlanV2(persisted ?? canonicalPlan);
        reset(savedPlan);
        toast.success("התפריט נשמר בהצלחה");
      } catch {
        toast.error(ERROR_MESSAGES.GENERIC_ERROR_MESSAGE);
      }
    },
    (invalidErrors) => {
      setTab("menu");
      const invalidMealIds = plan.meals.flatMap((meal, index) =>
        invalidErrors.meals?.[index]?.categories
          ? [getMealRenderId(meal, fields[index]?.id, index)]
          : []
      );
      setCollapsedIds((current) => {
        const next = new Set(current);
        invalidMealIds.forEach((id) => next.delete(id));
        return next;
      });
      toast.error("חסרים ערכי מאקרו בחלק מהארוחות");
    }
  );

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
                  onClick={handleOpenTemplateDialog}
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

        {submitCount > 0 && macroValidationMessages.length > 0 && (
          <section
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/25 dark:text-rose-200"
          >
            <div className="flex items-start gap-3">
              <FaTriangleExclamation className="mt-0.5 shrink-0" size={15} />
              <div>
                <h3 className="text-sm font-extrabold">לא ניתן לשמור עדיין</h3>
                <p className="mt-0.5 text-[11px] opacity-80">
                  יש להשלים את השדות הבאים. אפשר להזין 0 כשהערך באמת אפס.
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-xs font-semibold">
                  {macroValidationMessages.map((message) => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {tab === "menu" && (
          <>
            <div className="flex flex-col gap-4">
              {plan.meals.map((meal, index) => {
                const renderId = getMealRenderId(meal, fields[index]?.id, index);
                const siblingMeals = plan.meals.flatMap((candidate, candidateIndex) => {
                  if (candidateIndex === index) return [];

                  return [
                    {
                      id: getMealRenderId(candidate, fields[candidateIndex]?.id, candidateIndex),
                      name: candidate.name || `ארוחה ${candidateIndex + 1}`,
                      index: candidateIndex + 1,
                    },
                  ];
                });

                return (
                  <MealCard
                    key={renderId}
                    meal={meal}
                    index={index + 1}
                    collapsed={collapsedIds.has(renderId)}
                    siblingMeals={siblingMeals}
                    onCopyCategoryToMeal={(category, targetId) =>
                      copyCategoryToMeal(index, category, targetId)
                    }
                    onCopyCategoryToNewMeal={(category) => copyCategoryToNewMeal(index, category)}
                    onChange={(next) => updateMeal(index, next)}
                    onToggleCollapse={() => toggleCollapse(renderId)}
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
                );
              })}
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
            placeholder="כתוב דגשים, הנחיות ורשימות שיוצגו למתאמן…"
          />
        )}

        <DietPlanV2TemplateSaveDialog
          open={templateDialogOpen}
          onOpenChange={setTemplateDialogOpen}
          plan={plan}
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

const MACRO_FIELD_LABELS = {
  calories: "קלוריות",
  protein: "חלבון",
  carbs: "פחמימה",
  fat: "שומן",
} as const;

const CATEGORY_ERROR_LABELS: Record<DietV2MealCategory, string> = {
  protein: "חלבון",
  carbs: "פחמימה",
  fat: "שומן",
  vegetables: "ירקות",
};

const getMacroValidationMessages = (
  plan: IDietPlanV2,
  errors: FieldErrors<IDietPlanV2>
): string[] =>
  plan.meals.flatMap((meal, mealIndex) =>
    meal.categories.flatMap((category, categoryIndex) => {
      const macroErrors = errors.meals?.[mealIndex]?.categories?.[categoryIndex]?.macros;
      if (!macroErrors) return [];
      const missingFields = (
        Object.keys(MACRO_FIELD_LABELS) as Array<keyof typeof MACRO_FIELD_LABELS>
      )
        .filter((field) => macroErrors[field])
        .map((field) => MACRO_FIELD_LABELS[field]);
      if (missingFields.length === 0) return [];

      const mealName = meal.name.trim() || `ארוחה ${mealIndex + 1}`;
      return [
        `${mealName} · ${CATEGORY_ERROR_LABELS[category.category]}: ${missingFields.join(", ")}`,
      ];
    })
  );
