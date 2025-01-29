import React, { useState } from "react";
import FixedCardioContainer from "./FixedCardioContainer";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import CardioWeekWrapper from "./CardioWeekWrapper";
import { ICardioWeek, IComplexCardioType, ISimpleCardioType } from "@/interfaces/IWorkoutPlan";
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
  updateCardio: (cardio: IComplexCardioType | ISimpleCardioType) => void;
  cardioPlan: IComplexCardioType | ISimpleCardioType;
}

const CardioWrapper: React.FC<CardioWrapperProps> = ({ cardioPlan, updateCardio }) => {
  const [cardioType, setCardioType] = useState(cardioPlan?.weeks ? `complex` : `standard`);
  const [openModal, setOpenModal] = useState(false);
  const [tempCardioType, setTempCardioType] = useState<string | null>(null);

  const updateComplexCardioPlan = (week: ICardioWeek, index: number) => {
    const newObject = {
      ...cardioPlan,
      weeks: cardioPlan.weeks.map((w, i) => (i === index ? week : w)),
    };
    updateCardio(newObject);
  };

  const addWeek = () => {
    if (cardioPlan.weeks.length >= 4) {
      toast.error("אי אפשר להוסיף יותר מארבעה שבועות באימון");
      return;
    }

    const newObject = {
      ...cardioPlan,
      weeks: [
        ...cardioPlan.weeks,
        {
          ...cardioPlan.weeks[cardioPlan.weeks.length - 1],
          week: `שבוע ${cardioPlan.weeks.length + 1}`,
        },
      ],
    };

    updateCardio(newObject);
  };

  const removeWeek = (index: number) => {
    if (cardioPlan.weeks.length === 1) {
      toast.error(`אימון אירובי חייב לכלול לפחות שבוע אחד.`);
      return;
    }

    // Remove the specified week from the weeks array
    const newObject = {
      ...cardioPlan,
      weeks: removeItemAtIndex(index, cardioPlan.weeks),
    };

    // Update the name of each week to "שבוע [index+1]" format
    newObject.weeks = newObject.weeks.map((week, idx) => ({
      ...week,
      week: `שבוע ${idx + 1}`,
    }));

    // Update cardio plan
    updateCardio(newObject);
  };

  const updateSimpleCardioPlan = (cardioObject: ISimpleCardioType) => {
    const newObject = { ...cardioObject };

    if (cardioObject.minsPerWeek && cardioObject.timesPerWeek) {
      newObject.minsPerWorkout = cardioObject.minsPerWeek / cardioObject.timesPerWeek;
    }

    updateCardio(newObject);
  };

  const handleCardioTypeChange = (val: string) => {
    setTempCardioType(val);
    setOpenModal(true);
  };

  const onCardioTypeChange = (type: string) => {
    setCardioType(type);
    updateCardio(type == `standard` ? defaultSimpleCardioOption : defaultComplexCardioOption);
    setOpenModal(false);
  };

  return (
    <>
      <div className="gap-5 flex flex-col">
        <RadioGroup
          className="flex pt-5"
          defaultValue="standard"
          dir="rtl"
          value={cardioType}
          onValueChange={(val) => handleCardioTypeChange(val)}
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard">קבוע</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="complex" id="complex" />
            <Label htmlFor="complex">בחירה</Label>
          </div>
        </RadioGroup>

        {cardioType == `standard` && (
          <FixedCardioContainer
            existingObject={cardioPlan}
            updateWorkout={(obj) => updateSimpleCardioPlan(obj)}
          />
        )}
        {cardioType == `complex` && (
          <>
            {cardioPlan?.weeks.map((week, i) => (
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
