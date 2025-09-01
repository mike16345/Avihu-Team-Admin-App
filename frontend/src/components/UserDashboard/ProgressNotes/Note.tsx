import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/ui/buttons/DeleteButton";
import { IProgressNote } from "@/interfaces/IProgress";
import moment from "moment-timezone";
import React, { useMemo } from "react";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import ProgressTracker from "./ProgressTracker";

interface NoteProps {
  progressNote: IProgressNote;
}

const Note: React.FC<NoteProps> = ({
  progressNote: { content, date, trainer, cardio, diet, workouts },
}) => {
  const progressTrackers = useMemo(() => {
    const items = [];

    if (cardio) items.push({ label: "אירובי", value: cardio });
    if (workouts) items.push({ label: "אימונים", value: workouts });
    if (diet) items.push({ label: "תזונה", value: diet });

    return items;
  }, [cardio, workouts, diet]);

  return (
    <div className="border shadow rounded-lg  p-2 relative">
      <div className="absolute flex gap-1 left-0 pe-2">
        <Button
          type="button"
          variant={"ghost"}
          className="flex rounded items-center justify-center size-full p-3"
        >
          <HiOutlinePencilSquare />
        </Button>

        <DeleteButton onClick={() => {}} tip="מחק פתק" />
      </div>

      <span className="text-sm block">{trainer}</span>
      <span className="font-bold text-lg">{moment(date).format("DD/MM/YY")}</span>
      <div className="flex gap-2 flex-wrap">
        {progressTrackers.map(({ label, value }, i) => (
          <ProgressTracker key={i} label={label} value={value} />
        ))}
      </div>

      <div className="pt-2">{content}</div>
    </div>
  );
};

export default Note;
