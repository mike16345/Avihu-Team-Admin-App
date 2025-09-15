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
import { cn } from "@/lib/utils";

interface NoteProps {
  progressNote: IProgressNote;
  className?: string;
}

const Note: React.FC<NoteProps> = ({
  progressNote: { content, date, trainer, cardio, diet, workouts, _id },
  className,
}) => {
  const { id } = useParams();
  const { handleProgressNoteEdit } = useProgressNoteContext();
  const deleteNote = useDeleteProgressNote(id || "");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const progressTrackers = useMemo(() => {
    const items = [];

    if (diet) items.push({ label: "תזונה", value: diet });
    if (workouts) items.push({ label: "אימונים", value: workouts });
    if (cardio) items.push({ label: "אירובי", value: cardio });

    return items;
  }, [cardio, workouts, diet]);

  const handleEdit = () => {
    handleProgressNoteEdit({ content, date, trainer, cardio, diet, workouts, _id });
  };

  const handleDelete = () => {
    if (!id || !_id) return;

    deleteNote.mutate(_id);
  };

  return (
    <>
      <div className={cn("border shadow rounded-lg p-2 ", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-bold text-lg">{moment(date).format("DD/MM/YY")}</span>
            <span className="text-sm"> - {trainer}</span>
          </div>
          <div className="flex items-center">
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
        </div>
        <div className="flex gap-2 flex-wrap">
          {progressTrackers.map(({ label, value }, i) => (
            <ProgressTracker key={i} label={label} value={value} />
          ))}
        </div>

        {!!content.length && <p dangerouslySetInnerHTML={{ __html: content }}></p>}
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
