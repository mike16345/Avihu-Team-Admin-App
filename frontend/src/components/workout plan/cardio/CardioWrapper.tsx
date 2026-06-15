import React, { useState } from "react";
import FixedCardioContainer from "./FixedCardioContainer";
import CardioWeekWrapper from "./CardioWeekWrapper";
import { CardioType, ICardioWeek, IComplexCardioType } from "@/interfaces/IWorkoutPlan";
import { defaultComplexCardioOption, defaultSimpleCardioOption } from "@/constants/cardioOptions";
import { toast } from "sonner";
import type { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { useFieldArray, useFormContext } from "react-hook-form";
import CustomAlertDialog from "@/components/Alerts/DialogAlert/CustomAlertDialog";
import { FaPlus } from "react-icons/fa6";

const TYPE_OPTIONS: { id: CardioType; label: string }[] = [
  { id: "simple", label: "קבוע" },
  { id: "complex", label: "בחירה" },
];

const getTypeButtonClassName = (active: boolean) => {
  if (active) return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
  return "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800";
};

const getDefaultCardioPlan = (type: CardioType) => {
  if (type == "complex") return defaultComplexCardioOption;
  return defaultSimpleCardioOption;
};

const CardioWrapper: React.FC = () => {
  const {
    fields: weeks,
    append,
    remove,
    replace,
  } = useFieldArray<WorkoutSchemaType, "cardio.plan.weeks">({
    name: "cardio.plan.weeks",
  });

  const { watch, setValue } = useFormContext<WorkoutSchemaType>();
  const cardioPlan = watch("cardio");

  const [openModal, setOpenModal] = useState(false);
  const [tempCardioType, setTempCardioType] = useState<CardioType | null>(null);

  const addWeek = () => {
    if (weeks.length >= 4) {
      toast.error("אי אפשר להוסיף יותר מארבעה שבועות באימון");
      return;
    }
    const newWeek: ICardioWeek = {
      workouts: [{ name: `אימון 1`, cardioExercise: `הליכה מהירה`, distance: "" }],
      week: `שבוע ${weeks.length + 1}`,
    };
    append(newWeek);
  };

  const removeWeek = (index: number) => {
    if (weeks.length === 1) {
      toast.error(`אימון אירובי חייב לכלול לפחות שבוע אחד.`);
      return;
    }
    remove(index);
  };

  const handleCardioTypeChange = (val: CardioType) => {
    if (val === cardioPlan.type) return;
    setTempCardioType(val);
    setOpenModal(true);
  };

  const onCardioTypeChange = (type: CardioType) => {
    const isComplex = type == "complex";
    const plan = getDefaultCardioPlan(type);
    if (isComplex) replace((plan as IComplexCardioType).weeks);
    setOpenModal(false);
    setValue("cardio.plan", plan, { shouldDirty: true });
    setValue("cardio.type", type, { shouldDirty: true });
  };

  return (
    <div dir="rtl" className="flex flex-col gap-5 pb-5 font-heebo">
      <div className="inline-flex w-fit items-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
        {TYPE_OPTIONS.map((opt) => {
          const active = cardioPlan.type === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleCardioTypeChange(opt.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${getTypeButtonClassName(
                active
              )}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {cardioPlan.type == `simple` && <FixedCardioContainer />}

      {cardioPlan.type == `complex` && (
        <>
          {weeks.map((week, i) => (
            <CardioWeekWrapper
              key={week.id}
              weekName={(week as { week: string }).week}
              parentPath={`cardio.plan.weeks.${i}`}
              onDeleteWeek={() => removeWeek(i)}
            />
          ))}
          <button
            type="button"
            onClick={addWeek}
            className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <FaPlus size={10} />
            הוסף שבוע
          </button>
        </>
      )}

      <CustomAlertDialog
        alertDialogProps={{ open: openModal, onOpenChange: setOpenModal }}
        alertDialogContentProps={{
          children: (
            <>
              שינוי סוג התוכנית יגרום לאובדן כל המידע שביצעת עד כה. <br /> אתה בטוח שאתה רוצה
              להמשיך?
            </>
          ),
        }}
        alertDialogTitleProps={{ className: "py-1 text-2xl", children: "זהירות!" }}
        alertDialogHeaderProps={{ className: "border-b-2" }}
        alertDialogActionProps={{
          onClick: () => onCardioTypeChange(tempCardioType || "complex"),
          children: "כן, אני רוצה לשנות את הסוג",
        }}
        alertDialogCancelProps={{
          onClick: () => setOpenModal(false),
          children: "בטל",
        }}
      />
    </div>
  );
};

export default CardioWrapper;
