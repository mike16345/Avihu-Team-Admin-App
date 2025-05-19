import React, { useState } from "react";
import FixedCardioContainer from "./FixedCardioContainer";
import CardioWeekWrapper from "./CardioWeekWrapper";
import { CardioType, ICardioWeek, IComplexCardioType } from "@/interfaces/IWorkoutPlan";
import { Button } from "@/components/ui/button";
import { defaultComplexCardioOption, defaultSimpleCardioOption } from "@/constants/cardioOptions";
import { toast } from "sonner";
import type { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { useFieldArray, useFormContext } from "react-hook-form";
import CustomAlertDialog from "@/components/Alerts/DialogAlert/CustomAlertDialog";
import CustomRadioGroup, { IRadioItem } from "@/components/ui/CustomRadioGroup";

const radioItems: IRadioItem<string>[] = [
  {
    label: "קבוע",
    id: "simple",
    value: "simple",
  },
  {
    label: "בחירה",
    id: "complex",
    value: "complex",
  },
];

const CardioWrapper: React.FC = () => {
  const {
    fields: weeks,
    append,
    remove,
    replace,
  } = useFieldArray<WorkoutSchemaType, "cardio.plan.weeks">({
    name: "cardio.plan.weeks",
  });

  const { watch, getValues, setValue } = useFormContext<WorkoutSchemaType>();
  const cardioPlan = watch("cardio");

  const [openModal, setOpenModal] = useState(false);
  const [tempCardioType, setTempCardioType] = useState<CardioType | null>(null);

  const addWeek = () => {
    if (weeks.length >= 4) {
      toast.error("אי אפשר להוסיף יותר מארבעה שבועות באימון");
      return;
    }

    const newWeek: ICardioWeek = {
      workouts: [
        {
          name: `אימון 1`,
          cardioExercise: `הליכה מהירה`,
          distance: "",
        },
      ],
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
    setTempCardioType(val);
    setOpenModal(true);
  };

  const onCardioTypeChange = (type: CardioType) => {
    const isComplex = type == "complex";
    const plan = isComplex ? defaultComplexCardioOption : defaultSimpleCardioOption;

    if (isComplex) {
      replace((plan as IComplexCardioType).weeks);
    }

    setOpenModal(false);
    setValue("cardio.plan", plan);
    setValue("cardio.type", type);
  };

  return (
    <>
      <div className="flex flex-col gap-5 pb-5">
        <CustomRadioGroup
          items={radioItems}
          value={cardioPlan.type}
          onValueChange={(val: CardioType) => handleCardioTypeChange(val)}
          className="flex items-center pt-5"
          defaultValue="simple"
          dir="rtl"
        />

        {cardioPlan.type == `simple` && <FixedCardioContainer />}

        {cardioPlan.type == `complex` && (
          <>
            {weeks.map((week, i) => (
              <CardioWeekWrapper
                key={week.id}
                weekName={week.week}
                parentPath={`cardio.plan.weeks.${i}`}
                onDeleteWeek={() => removeWeek(i)}
              />
            ))}
            <Button type="button" onClick={addWeek} className="w-fit mb-4">
              הוסף שבוע
            </Button>
          </>
        )}
      </div>
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
          onClick: () => {
            onCardioTypeChange(tempCardioType || "complex");
          },
          children: "בטל",
        }}
      />
    </>
  );
};

export default CardioWrapper;
