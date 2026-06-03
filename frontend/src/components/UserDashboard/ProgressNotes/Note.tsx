/**
 * Note — single progress-note card.
 * Visual goals:
 *  - Clear date "chip" on one side
 *  - Trainer name as subtle tag
 *  - Progress metrics as colored pills (tinted by metric, dimmed by value)
 *  - Lightweight icon-only edit/delete actions on hover
 *  - Content rendered in a soft inner panel
 */
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/ui/buttons/DeleteButton";
import { IProgressNote } from "@/interfaces/IProgress";
import moment from "moment-timezone";
import "moment/dist/locale/he";
import React, { useMemo, useState } from "react";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { FaCalendarDay, FaUserTie } from "react-icons/fa6";
import { useProgressNoteContext } from "@/context/useProgressNoteContext";
import DeleteModal from "@/components/Alerts/DeleteModal";
import useDeleteProgressNote from "@/hooks/mutations/progressNotes/useDeleteProgressNote";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NoteProps {
  progressNote: IProgressNote;
  className?: string;
}

type MetricKey = "diet" | "workouts" | "cardio";
const METRIC_META: Record<MetricKey, { label: string; emoji: string; bg: string; ring: string; text: string }> = {
  diet:     { label: "תזונה",   emoji: "🥗", bg: "bg-emerald-50", ring: "ring-emerald-200", text: "text-emerald-700" },
  workouts: { label: "אימונים", emoji: "💪", bg: "bg-blue-50",    ring: "ring-blue-200",    text: "text-blue-700" },
  cardio:   { label: "אירובי",  emoji: "🏃", bg: "bg-amber-50",   ring: "ring-amber-200",   text: "text-amber-700" },
};

const MetricPill = ({ kind, value }: { kind: MetricKey; value: number }) => {
  const m = METRIC_META[kind];
  // Dim opacity below 75% so the eye is drawn to the strong metrics.
  const intensity = value >= 75 ? "opacity-100" : value >= 50 ? "opacity-90" : "opacity-75";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        m.bg,
        m.ring,
        m.text,
        intensity
      )}
    >
      <span className="text-sm leading-none">{m.emoji}</span>
      <span className="font-medium text-slate-600">{m.label}</span>
      <span className="font-bold">{value}%</span>
    </span>
  );
};

const Note: React.FC<NoteProps> = ({
  progressNote: { content, date, trainer, cardio, diet, workouts, _id },
  className,
}) => {
  const { id } = useParams();
  const { handleProgressNoteEdit } = useProgressNoteContext();
  const deleteNote = useDeleteProgressNote(id || "");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const metrics = useMemo(() => {
    const items: { kind: MetricKey; value: number }[] = [];
    if (diet) items.push({ kind: "diet", value: diet });
    if (workouts) items.push({ kind: "workouts", value: workouts });
    if (cardio) items.push({ kind: "cardio", value: cardio });
    return items;
  }, [cardio, workouts, diet]);

  const handleEdit = () => {
    handleProgressNoteEdit({ content, date, trainer, cardio, diet, workouts, _id });
  };

  const handleDelete = () => {
    if (!id || !_id) return;
    deleteNote.mutate(_id);
  };

  const dateObj = moment(date).locale("he");
  const dayMonth = dateObj.format("DD/MM");
  const year = dateObj.format("YY");
  // Hebrew weekday name. moment Hebrew returns "יום ראשון", strip the prefix.
  const dayName = dateObj.format("dddd").replace(/^יום\s*/, "יום ");

  return (
    <>
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-md",
          className
        )}
      >
        {/* Decorative side accent */}
        <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-blue-600" />

        <div className="flex flex-col gap-3 p-4 pr-5">
          {/* Header row: date chip + trainer + metrics + actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date chip */}
            <div className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
              <FaCalendarDay size={12} className="text-blue-600" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-slate-900">
                  {dayMonth}/{year}
                </span>
                <span className="text-[10px] font-medium text-slate-500">{dayName}</span>
              </div>
            </div>

            {/* Trainer */}
            {trainer && (
              <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                <FaUserTie size={10} className="text-slate-400" />
                <span>{trainer}</span>
              </div>
            )}

            {/* Metrics — centered between trainer and actions */}
            {metrics.length > 0 && (
              <div className="flex flex-1 flex-wrap items-center justify-center gap-1.5">
                {metrics.map((m) => (
                  <MetricPill key={m.kind} kind={m.kind} value={m.value} />
                ))}
              </div>
            )}

            {/* Actions — visible on hover */}
            <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-lg p-0 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                onClick={handleEdit}
                title="ערוך פתק"
              >
                <HiOutlinePencilSquare size={15} />
              </Button>
              <DeleteButton onClick={() => setOpenDeleteDialog(true)} tip="מחק פתק" />
            </div>
          </div>

          {/* Content */}
          {!!content?.length && (
            <div
              className="rounded-lg bg-slate-50/60 px-3 py-2 text-sm leading-relaxed text-slate-700 [&_a]:text-blue-600 [&_a]:underline [&_p]:m-0 [&_strong]:text-slate-900"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
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
