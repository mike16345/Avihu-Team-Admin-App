import React, { useEffect, useState } from "react";
import FixedCardioContainer from "./FixedCardioContainer";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CardioWeekWrapper from "./CardioWeekWrapper";
import { ICardioPlan, ICardioWeek, ISimpleCardioType } from "@/interfaces/IWorkoutPlan";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { defaultComplexCardioOption, defaultSimpleCardioOption } from "@/constants/cardioOptions";
import { toast } from "sonner";
import { removeItemAtIndex } from "@/utils/utils";

interface CardioWrapperProps {
  updateCardio: (cardio: ICardioPlan) => void;
  cardioPlan: ICardioPlan;
}

const CardioWrapper: React.FC<CardioWrapperProps> = ({ cardioPlan, updateCardio }) => {
  const [openModal, setOpenModal] = useState(false);
  const [tempCardioType, setTempCardioType] = useState<string | null>(null);

  const updateComplexCardioPlan = (week: ICardioWeek, index: number) => {
    const newObject: ICardioPlan = {
      ...cardioPlan,
      plan: {
        ...cardioPlan.plan,
        weeks: cardioPlan.plan.weeks.map((w, i) => (i === index ? week : w)),
      },
    };

    // Update cardio plan
    updateCardio(newObject);
  };

  const addWeek = () => {
    if (cardioPlan.plan.weeks.length >= 4) {
      toast.error("אי אפשר להוסיף יותר מארבעה שבועות באימון");
      return;
    }

    const newWeek: ICardioWeek = {
      ...cardioPlan.plan.weeks[cardioPlan.plan.weeks.length - 1], // Copy last week's structure
      week: `שבוע ${cardioPlan.plan.weeks.length + 1}`,
    };

    const newObject: ICardioPlan = {
      ...cardioPlan,
      plan: {
        ...cardioPlan.plan,
        weeks: [...cardioPlan.plan.weeks, newWeek],
      },
    };

    updateCardio(newObject);
  };

  const removeWeek = (index: number) => {
    if (cardioPlan.plan.weeks.length === 1) {
      toast.error(`אימון אירובי חייב לכלול לפחות שבוע אחד.`);
      return;
    }
    const updatedWeeks = removeItemAtIndex(index, cardioPlan.plan.weeks).map((week, idx) => ({
      ...week,
      week: `שבוע ${idx + 1}`,
    }));

    // Construct the updated cardioPlan object
    const newObject: ICardioPlan = {
      ...cardioPlan,
      plan: {
        ...cardioPlan.plan,
        weeks: updatedWeeks,
      },
    };

    // Update cardio plan
    updateCardio(newObject);
  };

  const updateSimpleCardioPlan = (cardioObject: ISimpleCardioType) => {
    const newObject = { ...cardioPlan, plan: cardioObject };

    if (cardioObject.minsPerWeek && cardioObject.timesPerWeek) {
      newObject.plan.minsPerWorkout = cardioObject.minsPerWeek / cardioObject.timesPerWeek;
    }

    updateCardio(newObject);
  };

  const handleCardioTypeChange = (val: string) => {
    setTempCardioType(val);
    setOpenModal(true);
  };

  const onCardioTypeChange = (type: `simple` | `complex`) => {
    updateCardio({
      type,
      plan: type == `simple` ? defaultSimpleCardioOption : defaultComplexCardioOption,
    });
    setOpenModal(false);
  };

  return (
    <>
      <div className="gap-5 flex flex-col">
        <RadioGroup
          className="flex pt-5"
          defaultValue="simple"
          dir="rtl"
          value={cardioPlan.type}
          onValueChange={(val) => handleCardioTypeChange(val)}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="simple" id="simple" />
            <Label htmlFor="simple">קבוע</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="complex" id="complex" />
            <Label htmlFor="complex">בחירה</Label>
          </div>
        </RadioGroup>

        {cardioPlan.type == `simple` && (
          <FixedCardioContainer
            existingObject={cardioPlan.plan}
            updateWorkout={(obj) => updateSimpleCardioPlan(obj)}
          />
        )}
        {cardioPlan.type == `complex` && (
          <>
            {cardioPlan?.plan?.weeks?.map((week, i) => (
              <CardioWeekWrapper
                deleteWeek={() => removeWeek(i)}
                key={i}
                week={week}
                setWeek={(obj) => updateComplexCardioPlan(obj, i)}
              />
            ))}
            <Button onClick={addWeek} className="w-fit mb-4">
              הוסף שבוע
            </Button>
          </>
        )}
      </div>
      <Dialog open={openModal} onOpenChange={() => setOpenModal(false)}>
        <DialogContent className="w-[80vw] rounded md:w-[auto]">
          <DialogHeader className="p-5 border-b-2">
            <DialogTitle className="text-right py-2 text-2xl">זהירות!</DialogTitle>
            <DialogDescription className="text-right">
              שינוי סוג התוכנית יגרום לאובדן כל המידע שביצעת עד כה. <br /> אתה בטוח שאתה רוצה
              להמשיך?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" className="me-5" onClick={() => setOpenModal(false)}>
              לא, תודה
            </Button>
            <Button onClick={() => onCardioTypeChange(tempCardioType || ``)}>
              כן, אני רוצה לשנות את הסוג
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CardioWrapper;
