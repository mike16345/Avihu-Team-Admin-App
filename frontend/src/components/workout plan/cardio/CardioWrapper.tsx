import React, { useState } from "react";
import FixedCardioContainer from "./FixedCardioContainer";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CardioWeekWrapper from "./CardioWeekWrapper";
import {
  CardioType,
  ICardioPlan,
  ICardioWeek,
  IComplexCardioType,
  ISimpleCardioType,
} from "@/interfaces/IWorkoutPlan";
import { Button } from "@/components/ui/button";
import { defaultComplexCardioOption, defaultSimpleCardioOption } from "@/constants/cardioOptions";
import { toast } from "sonner";
import type { WorkoutSchemaType } from "@/schemas/workoutPlanSchema";
import { useFieldArray, useFormContext } from "react-hook-form";
import CustomAlertDialog from "@/components/Alerts/DialogAlert/CustomAlertDialog";

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
        <RadioGroup
          value={cardioPlan.type}
          onValueChange={(val: CardioType) => handleCardioTypeChange(val)}
          className="flex items-center pt-5"
          defaultValue="simple"
          dir="rtl"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem type="button" value="simple" id="simple" />
            <Label htmlFor="simple">קבוע</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem type="button" value="complex" id="complex" />
            <Label htmlFor="complex">בחירה</Label>
          </div>
        </RadioGroup>

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
