/**
 * ExerciseDetailDialog — in-modal exercise preview.
 *
 * Opened from the ExercisePresetGrid card. Shows:
 *   - Embedded YouTube player (or uploaded image fallback)
 *   - Exercise name
 *   - Muscle group + training method badges
 *   - Trainer tip / emphasis (`tipFromTrainer`)
 *
 * Keeps the user inside the app — no external tabs.
 */
import React, { useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { IExercisePresetItem } from "@/interfaces/IWorkoutPlan";
import { buildPhotoUrl } from "@/lib/utils";
import {
  FaDumbbell,
  FaCircleInfo,
  FaArrowUpRightFromSquare,
  FaPenToSquare,
} from "react-icons/fa6";

interface ExerciseDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: IExercisePresetItem | null;
  onEdit?: (id: string) => void;
}

/**
 * Convert any YouTube URL (watch, shortened, or embed) to a clean
 * embed URL we can drop into an <iframe>. Returns null if we can't
 * recognise the format.
 */
const toYouTubeEmbed = (url: string): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // youtu.be/<id>
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1).split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    // youtube.com/watch?v=<id>
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (parsed.pathname.startsWith("/embed/")) return url;
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/")[2];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    }
  } catch {
    /* fall through */
  }
  return null;
};

const ExerciseDetailDialog: React.FC<ExerciseDetailDialogProps> = ({
  open,
  onOpenChange,
  exercise,
  onEdit,
}) => {
  const embedUrl = useMemo(
    () => (exercise?.linkToVideo ? toYouTubeEmbed(exercise.linkToVideo) : null),
    [exercise?.linkToVideo]
  );

  if (!exercise) return null;

  const fallbackImage = exercise.imageUrl ? buildPhotoUrl(exercise.imageUrl) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-w-3xl max-h-[90vh] overflow-hidden p-0 gap-0 rounded-2xl flex flex-col"
        style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
      >
        {/* Header */}
        <header className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60">
            <FaDumbbell size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {exercise.name}
            </h2>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {exercise.muscleGroup && (
                <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {exercise.muscleGroup}
                </span>
              )}
              {exercise.exerciseMethod && (
                <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                  {exercise.exerciseMethod}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Video / image */}
          <div className="bg-slate-900">
            {embedUrl ? (
              <div className="relative w-full aspect-video">
                <iframe
                  src={embedUrl}
                  title={exercise.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            ) : fallbackImage ? (
              <img
                src={fallbackImage}
                alt={exercise.name}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center text-slate-500">
                <div className="flex flex-col items-center gap-2">
                  <FaDumbbell size={36} />
                  <span className="text-xs">אין סרטון זמין</span>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4 p-6">
            {/* Trainer tip — stored as HTML by the rich-text editor, so
                we render it via dangerouslySetInnerHTML inside a styled
                `prose` container. The content is internal (trainer-owned),
                not user-submitted, so XSS exposure is limited to what the
                trainer types themselves. */}
            {exercise.tipFromTrainer ? (
              <section className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 p-4">
                <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  <FaCircleInfo size={11} />
                  דגשים מהמאמן
                </h3>
                <div
                  className="prose prose-sm max-w-none text-sm leading-relaxed text-slate-700 dark:text-slate-200 [&_p]:my-1 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pr-5 [&_ol]:list-decimal [&_ol]:pr-5"
                  dangerouslySetInnerHTML={{ __html: exercise.tipFromTrainer }}
                />
              </section>
            ) : (
              <p className="text-center text-xs text-slate-400">
                אין דגשים מיוחדים מהמאמן עבור התרגיל הזה.
              </p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <footer className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-6 py-3">
          {exercise.linkToVideo && (
            <a
              href={exercise.linkToVideo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-300 hover:text-blue-700"
            >
              <FaArrowUpRightFromSquare size={10} />
              פתח ב-YouTube
            </a>
          )}
          {onEdit && exercise._id && (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onEdit(exercise._id!);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700"
            >
              <FaPenToSquare size={10} />
              עריכה
            </button>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDetailDialog;
