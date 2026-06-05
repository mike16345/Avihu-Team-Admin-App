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

interface DietPlanFormProps extends PropsWithChildren {}

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

const DietPlanForm: React.FC<DietPlanFormProps> = ({ children }) => {
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
  const instructions = watch("customInstructions")?.join(" ") || "";
  const supplements = watch("supplements")?.join(" ") || "";

  const handleAddMeal = () => {
    append(cloneDefaultMeal());
  };

  const handleDeleteMeal = () => {
    if (mealToDelete == null) return;

    remove(mealToDelete);
    setMealToDelete(null);
  };

  useUnsavedChangesWarning(formIsDirty);

  return (
    <div className=" flex flex-col gap-4 w-full h-auto">
      <DietplanTabs
        tips={
          <TextEditor
            value={instructions}
            onChange={(val) =>
              setValue("customInstructions", [val], { shouldDirty: true })
            }
          />
        }
        supplements={
          <TextEditor
            value={supplements}
            onChange={(val) => setValue("supplements", [val], { shouldDirty: true })}
          />
        }
        dietplan={
          <div className="w-full flex flex-col  gap-5">
            <div
              dir="rtl"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm w-fit"
              style={{ fontFamily: "Heebo, system-ui, sans-serif" }}
            >
              <div className="flex flex-col">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  קלוריות חופשיות
                </Label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  מתווסף לסך היומי
                </span>
              </div>
              <div className="relative">
                <Input
                  className="h-9 w-28 pe-12 text-end text-sm font-bold"
                  type="number"
                  value={freeCalories}
                  onChange={(e) =>
                    setValue("freeCalories", Number(e.target.value), {
                      shouldDirty: true,
                    })
                  }
                />
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 dark:text-slate-500">
                  קק״ל
                </span>
              </div>
            </div>
            <div className="w-full flex flex-col gap-3">
              {fields.map((field, index) => (
                <MealDropDown
                  key={field.id}
                  customItems={customItems}
                  mealNumber={index + 1}
                  mealIndex={index}
                  onDelete={() => {
                    setMealToDelete(index);
                    setOpenDeleteModal(true);
                  }}
                />
              ))}
              <AddButton tip="הוסף ארוחה" onClick={handleAddMeal} />
            </div>
          </div>
        }
      />

      {children}

      <DeleteModal
        onConfirm={() => handleDeleteMeal()}
        onCancel={() => setMealToDelete(null)}
        isModalOpen={openDeleteModal}
        setIsModalOpen={setOpenDeleteModal}
      />
    </div>
  );
};

export default DietPlanForm;
