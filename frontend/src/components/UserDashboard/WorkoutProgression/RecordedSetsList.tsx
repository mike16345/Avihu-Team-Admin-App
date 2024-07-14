import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { SetDetails } from "./SetDetails";
import { WorkoutPlan } from "@/enums/WorkoutPlans";
import { IRecordedSet } from "@/interfaces/IWorkout";

const recordedSetsByDate: { [date: string]: IRecordedSet[] } = {
  "2024-07-01": [
    {
      workoutPlan: WorkoutPlan.WorkoutABeginner,
      weight: 100,
      repsDone: 10,
      date: new Date("2024-07-01"),
      note: "Felt strong today, good form. Felt strong today, good form. Felt strong today, good form.Felt strong today, good form.Felt strong today, good form.Felt strong today, good form.Felt strong today, good form.",
    },
    {
      workoutPlan: WorkoutPlan.WorkoutAAdvanced,
      weight: 105,
      repsDone: 8,
      date: new Date("2024-07-01"),
      note: "Increased weight, but struggled with the last rep.",
    },
    {
      workoutPlan: WorkoutPlan.WorkoutAPro,
      weight: 110,
      repsDone: 6,
      date: new Date("2024-07-01"),
      note: "First time hitting 110, form could be better.",
    },
    {
      workoutPlan: WorkoutPlan.WorkoutBBeginner,
      weight: 100,
      repsDone: 12,
      date: new Date("2024-07-01"),
      note: "Deloaded to work on form, felt easier.",
    },
  ],
  "2024-07-02": [
    {
      workoutPlan: WorkoutPlan.WorkoutBAdvanced,
      weight: 115,
      repsDone: 4,
      date: new Date("2024-07-02"),
      note: "Personal best! Need to work on endurance.",
    },
    {
      workoutPlan: WorkoutPlan.WorkoutBPro,
      weight: 120,
      repsDone: 5,
      date: new Date("2024-07-02"),
      note: "Solid workout, but could improve form.",
    },
    {
      workoutPlan: WorkoutPlan.WorkoutCBeginner,
      weight: 90,
      repsDone: 10,
      date: new Date("2024-07-02"),
      note: "Good endurance today.",
    },
    {
      workoutPlan: WorkoutPlan.WorkoutCAdvanced,
      weight: 95,
      repsDone: 8,
      date: new Date("2024-07-02"),
      note: "Felt strong, but need to work on stamina.",
    },
  ],
  // Add more dates and sets as needed
};

export const RecordedSetsList = () => {
  const [isOpen, setIsOpen] = useState<{ [key: string]: boolean }>({});

  const toggleOpen = (date: string) => {
    setIsOpen((prevState) => ({
      ...prevState,
      [date]: !prevState[date],
    }));
  };

  return (
    <>
      {Object.keys(recordedSetsByDate).map((date) => (
        <Collapsible
          dir="ltr"
          key={date}
          open={isOpen[date]}
          onOpenChange={() => toggleOpen(date)}
          className="w-full flex flex-col p-4 border-b last:border-b-0 "
        >
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex flex-col justify-center items-center">
                <h1 className="font-bold bg-secondary rounded-full p-2">
                  {new Date(date).toLocaleString("default", { month: "short" }).toUpperCase()}
                </h1>
                <h2 className="text-muted-foreground">{new Date(date).getDate()}</h2>
              </div>
              <div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  Total reps:{" "}
                  {recordedSetsByDate[date].reduce((total, set) => total + set.repsDone, 0)}
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  Total weight:{" "}
                  {recordedSetsByDate[date].reduce((total, set) => total + set.weight, 0)} kg
                </div>
              </div>
              {recordedSetsByDate[date].length > 1 && (
                <Button
                  onClick={() => toggleOpen(date)}
                  variant="ghost"
                  size="sm"
                  className={`w-9 p-0 transition ${isOpen[date] ? "rotate-180" : "rotate-0"}`}
                >
                  <FaChevronDown className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </Button>
              )}
            </div>
          </div>
          {recordedSetsByDate[date].length > 0 && (
            <CollapsibleContent className="flex flex-col gap-3 mt-2">
              {recordedSetsByDate[date].map((set, index) => (
                <SetDetails set={set} index={index} key={index} />
              ))}
            </CollapsibleContent>
          )}
        </Collapsible>
      ))}
    </>
  );
};
