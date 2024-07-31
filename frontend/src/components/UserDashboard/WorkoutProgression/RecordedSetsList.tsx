import { IRecordedSet } from "@/interfaces/IWorkout";
import { Collapsible, CollapsibleContent } from "@radix-ui/react-collapsible";
import React, { FC, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { SetDetails } from "./SetDetails";
import { Button } from "@/components/ui/button";

interface RecordedSetsListProps {
  recordedSets: IRecordedSet[];
}

export const RecordedSetsList: FC<RecordedSetsListProps> = ({ recordedSets }) => {
  const [isOpen, setIsOpen] = useState<{ [key: string]: boolean }>({});

  const recordedSetsByDate = recordedSets.reduce((acc, set) => {
    const date = new Date(set.date).toISOString().split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(set);
    return acc;
  }, {} as { [date: string]: IRecordedSet[] });

  const recordedSetsByDatesKeys = Object.keys(recordedSetsByDate);

  const toggleOpen = (date: string) => {
    setIsOpen((prevState) => ({
      ...prevState,
      [date]: !prevState[date],
    }));
  };

  return (
    <>
      {recordedSetsByDatesKeys.map((date) => {
        const setsForDate = recordedSetsByDate[date];
        const shortMonth = new Date(date)
          .toLocaleString("default", { month: "short" })
          .toUpperCase();
        const dateAsLocaleString = new Date(date).toLocaleDateString();

        return (
          <Collapsible
            dir="ltr"
            key={date}
            open={isOpen[dateAsLocaleString]}
            onOpenChange={() => toggleOpen(dateAsLocaleString)}
            className={`w-full flex flex-col p-4 border-b ${
              recordedSetsByDatesKeys.length > 1 && "last:border-b-0"
            } `}
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex flex-col justify-center items-center">
                  <h1 className="font-bold bg-secondary rounded-full p-2">
                    {shortMonth.toUpperCase()}
                  </h1>
                  <h2 className="text-muted-foreground">{new Date(date).getDate()}</h2>
                </div>
                <div>
                  <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    Total sets: {setsForDate.length}
                  </div>
                  <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    Total weight: {setsForDate.reduce((total, set) => total + set.weight, 0)} kg
                  </div>
                </div>
                {setsForDate.length && (
                  <Button
                    onClick={() => toggleOpen(dateAsLocaleString)}
                    variant="ghost"
                    size="sm"
                    className={`w-9 p-0 transition ${
                      isOpen[dateAsLocaleString] ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <FaChevronDown className="h-4 w-4" />
                    <span className="sr-only">Toggle</span>
                  </Button>
                )}
              </div>
            </div>
            {setsForDate.length && (
              <CollapsibleContent className="flex flex-col gap-3 mt-2">
                {setsForDate.map((set, index) => (
                  <SetDetails set={set} index={index} key={index} />
                ))}
              </CollapsibleContent>
            )}
          </Collapsible>
        );
      })}
    </>
  );
};
