import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/ui/buttons/DeleteButton";
import { IProgressNote } from "@/interfaces/IProgress";
import moment from "moment-timezone";
import React, { useMemo, useState } from "react";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import ProgressTracker from "./ProgressTracker";
import { useProgressNoteContext } from "@/context/useProgressNoteContext";
import DeleteModal from "@/components/Alerts/DeleteModal";
import useDeleteProgressNote from "@/hooks/mutations/progressNotes/useDeleteProgressNote";
import { useParams } from "react-router-dom";

interface NoteProps {
  progressNote: IProgressNote;
}

const Note: React.FC<NoteProps> = ({
  progressNote: { content, date, trainer, cardio, diet, workouts, _id },
}) => {
  const { id } = useParams();
  const { handleProgressNoteEdit } = useProgressNoteContext();
  const deleteNote = useDeleteProgressNote(id || "", _id || "");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const progressTrackers = useMemo(() => {
    const items = [];

    if (cardio) items.push({ label: "אירובי", value: cardio });
    if (workouts) items.push({ label: "אימונים", value: workouts });
    if (diet) items.push({ label: "תזונה", value: diet });

    return items;
  }, [cardio, workouts, diet]);

  const handleEdit = () => {
    handleProgressNoteEdit({ content, date, trainer, cardio, diet, workouts, _id });
  };

  const handleDelete = () => {
    deleteNote.mutate();
  };

  return (
    <>
      <div className="border shadow rounded-lg  p-2 relative">
        <div className="absolute flex gap-1 left-0 pe-2">
          <Button
            type="button"
            variant={"ghost"}
            className="flex rounded items-center justify-center size-full p-3"
            onClick={handleEdit}
          >
            <HiOutlinePencilSquare />
          </Button>

          <DeleteButton onClick={() => setOpenDeleteDialog(true)} tip="מחק פתק" />
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

      <DeleteModal
        isModalOpen={openDeleteDialog}
        setIsModalOpen={() => setOpenDeleteDialog(false)}
        onCancel={() => setOpenDeleteDialog(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default Note;
