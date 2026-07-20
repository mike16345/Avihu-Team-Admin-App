import React, { PropsWithChildren, useMemo, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MealDropDown } from "./MealDropDown";
import DeleteModal from "../Alerts/DeleteModal";
import { CustomItems, IDietPlan } from "@/interfaces/IDietPlan";
import { defaultMeal } from "@/constants/DietPlanConsts";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import useMenuItemsQuery from "@/hooks/queries/menuItems/useMenuItemsQuery";
import AddButton from "../ui/buttons/AddButton";
import DietplanTabs from "./DietPlanTabs";
import TextEditor from "../ui/TextEditor";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface DietPlanFormProps extends PropsWithChildren {
  presetLoader?: React.ReactNode;
}

const EMPTY_CUSTOM_ITEMS: CustomItems = {
  protein: [],
  carbs: [],
  fats: [],
  vegetables: [],
};

const cloneDietItem = (item: typeof defaultMeal.totalProtein) => ({
  quantity: item.quantity,
  customItems: [...(item.customItems || [])],
  extraItems: [...(item.extraItems || [])],
});

const cloneDefaultMeal = () => ({
  totalProtein: cloneDietItem(defaultMeal.totalProtein),
  totalCarbs: cloneDietItem(defaultMeal.totalCarbs),
  totalFats: cloneDietItem(defaultMeal.totalFats),
  totalVeggies: cloneDietItem(defaultMeal.totalVeggies),
});

const getTextEditorValue = (value: string[] | undefined) => value?.join(" ") || "";

const DietPlanForm: React.FC<DietPlanFormProps> = ({ children, presetLoader }) => {
  const form = useFormContext<IDietPlan>();
  const {
    control,
    watch,
    setValue,
    formState: { isDirty: formIsDirty },
  } = form;

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<number | null>(null);
  const { data: customItemsData } = useMenuItemsQuery();

  const customItems = useMemo(() => customItemsData || EMPTY_CUSTOM_ITEMS, [customItemsData]);

  const { fields, append, remove } = useFieldArray({ control, name: "meals" });

  const freeCalories = watch("freeCalories") || 0;
  const instructions = getTextEditorValue(watch("customInstructions"));
  const supplements = getTextEditorValue(watch("supplements"));

  const handleAddMeal = () => {
    append(cloneDefaultMeal());
  };

  const handleDeleteMeal = () => {
    if (mealToDelete === null) return;

    remove(mealToDelete);
    setMealToDelete(null);
  };

  const handleRequestDeleteMeal = (index: number) => {
    setMealToDelete(index);
    setOpenDeleteModal(true);
  };

  const renderTipsEditor = () => (
    <TextEditor
      value={instructions}
      onChange={(val) => setValue("customInstructions", [val], { shouldDirty: true })}
    />
  );

  const renderSupplementsEditor = () => (
    <TextEditor
      value={supplements}
      onChange={(val) => setValue("supplements", [val], { shouldDirty: true })}
    />
  );

  const renderFreeCaloriesChip = () => (
    <div
      dir="rtl"
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-heebo shadow-sm transition-transform duration-150 hover:scale-105 dark:border-slate-800 dark:bg-slate-900"
    >
      <Label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
        קלוריות חופשיות
      </Label>
      <div className="relative">
        <Input
          className="h-7 w-20 pe-9 text-end text-base font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          type="number"
          value={freeCalories}
          onChange={(e) =>
            setValue("freeCalories", Number(e.target.value), { shouldDirty: true })
          }
        />
        <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-xs text-slate-400 dark:text-slate-500">
          קק״ל
        </span>
      </div>
    </div>
  );

  const renderDietPlanEditor = () => (
    <div className="flex w-full flex-col gap-3">
      {fields.map((field, index) => (
        <MealDropDown
          key={field.id}
          customItems={customItems}
          mealNumber={index + 1}
          mealIndex={index}
          onDelete={() => handleRequestDeleteMeal(index)}
        />
      ))}
      <AddButton tip="הוסף ארוחה" onClick={handleAddMeal} />
    </div>
  );

  useUnsavedChangesWarning(formIsDirty);

  return (
    <div className="flex h-auto w-full flex-col gap-4">
      <DietplanTabs
        tips={renderTipsEditor()}
        supplements={renderSupplementsEditor()}
        dietplan={renderDietPlanEditor()}
        dietplanToolbar={renderFreeCaloriesChip()}
        presetLoader={presetLoader}
      />

      {children}

      <DeleteModal
        onConfirm={handleDeleteMeal}
        onCancel={() => setMealToDelete(null)}
        isModalOpen={openDeleteModal}
        setIsModalOpen={setOpenDeleteModal}
      />
    </div>
  );
};

export default DietPlanForm;
