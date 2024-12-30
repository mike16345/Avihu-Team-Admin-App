import { IRecordedSet } from "@/interfaces/IWorkout";
import { Collapsible, CollapsibleContent } from "@radix-ui/react-collapsible";
import { FC, useState } from "react";
import { SetDetails } from "./SetDetails";
import SetDropDownHeader from "./SetDropDownHeader";

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
        const dateAsLocaleString = new Date(date).toLocaleDateString();

        return (
          <Collapsible
            key={date}
            open={isOpen[dateAsLocaleString]}
            onOpenChange={() => toggleOpen(dateAsLocaleString)}
            className={`w-full flex flex-col p-4 border-b ${
              recordedSetsByDatesKeys.length > 1 && "last:border-b-0"
            } `}
          >
            <SetDropDownHeader
              date={date}
              isOpen={isOpen[dateAsLocaleString]}
              setsForDate={setsForDate}
              onToggleDropDown={() => toggleOpen(dateAsLocaleString)}
            />
            {setsForDate.length && (
              <CollapsibleContent className="flex flex-col overflow-y-scroll hide-scrollbar max-h-[600px] gap-3 mt-2">
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
