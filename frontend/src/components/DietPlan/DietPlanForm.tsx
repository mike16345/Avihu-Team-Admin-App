import React, { PropsWithChildren, useMemo, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { MealDropDown } from "./MealDropDown";
import DeleteModal from "../Alerts/DeleteModal";
import { CustomItems, IDietPlan } from "@/interfaces/IDietPlan";
import { defaultMeal } from "@/constants/DietPlanConsts";
import CustomInstructions from "./CustomInstructions";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";
import useMenuItemsQuery from "@/hooks/queries/menuItems/useMenuItemsQuery";
import AddButton from "../ui/buttons/AddButton";

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
  const instructions = watch("customInstructions") || [];
  const supplements = watch("supplements") || [];

  const handleAddMeal = () => {
    append(cloneDefaultMeal());
  };

  const handleDeleteMeal = () => {
    if (mealToDelete == null) return;

    remove(mealToDelete);
    setMealToDelete(null);
  };

  const handleUpdateInstructions = (
    key: "freeCalories" | "customInstructions" | "supplements",
    val: any
  ) => {
    setValue(key, val, { shouldDirty: true, shouldTouch: true });
  };

  useUnsavedChangesWarning(formIsDirty);

  return (
    <div className=" flex flex-col gap-4 w-full h-auto">
      <div className="w-full flex flex-col sm:flex-row gap-4">
        <div className="sm:w-3/4 w-full flex flex-col gap-2 ">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className={`border-b`}>
                <MealDropDown
                  customItems={customItems}
                  mealNumber={index + 1}
                  mealIndex={index}
                  onDelete={() => {
                    setMealToDelete(index);
                    setOpenDeleteModal(true);
                  }}
                />
              </div>
            ))}
          </div>
          <AddButton tip="הוסף ארוחה" onClick={handleAddMeal} />
          {children}
        </div>
        <div className="sm:w-1/4">
          <CustomInstructions
            instructions={instructions}
            freeCalories={freeCalories}
            supplements={supplements}
            onUpdate={handleUpdateInstructions}
          />
        </div>
      </div>
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
