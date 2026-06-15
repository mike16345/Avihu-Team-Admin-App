import React, { ReactNode, useMemo, useState } from "react";
import { IExercisePresetItem } from "@/interfaces/IWorkoutPlan";
import { buildPhotoUrl, getYouTubeThumbnail } from "@/lib/utils";
import FilterMultiSelect from "../../tables/FilterMultiSelect";
import ExerciseDetailDialog from "./ExerciseDetailDialog";
import {
  FaMagnifyingGlass,
  FaPlay,
  FaPenToSquare,
  FaTrash,
  FaDumbbell,
  FaVideo,
} from "react-icons/fa6";

interface ExercisePresetGridProps {
  data: IExercisePresetItem[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  actionButton?: ReactNode;
}

const getExerciseCountLabel = (count: number) => {
  if (count === 1) return "תרגיל";
  return "תרגילים";
};

const ExercisePresetGrid: React.FC<ExercisePresetGridProps> = ({
  data,
  onView,
  onDelete,
  actionButton,
}) => {
  const [search, setSearch] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [previewExercise, setPreviewExercise] = useState<IExercisePresetItem | null>(null);

  const muscleGroupOptions = useMemo(() => {
    const groups = new Set<string>();
    data.forEach((item) => {
      if (item.muscleGroup) groups.add(item.muscleGroup);
    });
    return Array.from(groups).map((g) => ({ name: g, value: g }));
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((item) => {
      if (q && !item.name?.toLowerCase().includes(q)) return false;
      if (selectedGroups.length && !selectedGroups.includes(item.muscleGroup)) return false;
      return true;
    });
  }, [data, search, selectedGroups]);

  const getThumbnail = (item: IExercisePresetItem): string | null => {
    if (item.imageUrl) return buildPhotoUrl(item.imageUrl);
    if (item.linkToVideo) {
      const yt = getYouTubeThumbnail(item.linkToVideo);
      if (yt) return yt;
    }
    return null;
  };
  const hasNoResults = filtered.length === 0;
  const exerciseCountLabel = getExerciseCountLabel(filtered.length);

  return (
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1 max-w-[360px]">
          <FaMagnifyingGlass
            size={11}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם תרגיל…"
            className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pr-8 pl-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900"
          />
        </div>

        {muscleGroupOptions.length > 0 && (
          <FilterMultiSelect
            className="w-60"
            label="קבוצות שריר"
            options={muscleGroupOptions}
            selected={selectedGroups}
            onChange={setSelectedGroups}
            placeholder="כל הקבוצות"
          />
        )}

        <span className="text-xs text-slate-500 dark:text-slate-400">
          {filtered.length} {exerciseCountLabel}
          {filtered.length !== data.length && ` מתוך ${data.length}`}
        </span>

        <div className="ms-auto">{actionButton}</div>
      </div>

      {hasNoResults && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 shadow-sm">
            <FaDumbbell size={20} />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">לא נמצאו תרגילים</p>
        </div>
      )}
      {!hasNoResults && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const thumb = getThumbnail(item);
            return (
              <article
                key={item._id}
                onClick={() => setPreviewExercise(item)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      <FaDumbbell size={36} />
                    </div>
                  )}
                  <div
                    aria-hidden
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg ring-2 ring-white">
                      <FaPlay size={14} className="ms-0.5" />
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-3.5">
                  <h3 className="line-clamp-2 text-sm font-bold leading-tight text-slate-900 dark:text-slate-100">
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {item.muscleGroup && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {item.muscleGroup}
                      </span>
                    )}
                    {item.exerciseMethod && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        {item.exerciseMethod}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                    {item.linkToVideo && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewExercise(item);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FaVideo size={11} />
                        סרטון
                      </button>
                    )}
                    {!item.linkToVideo && <span className="text-xs text-slate-400">ללא סרטון</span>}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item._id) onView(item._id);
                        }}
                        aria-label="עריכה"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40"
                      >
                        <FaPenToSquare size={10} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item._id && confirm(`למחוק את "${item.name}"?`)) onDelete(item._id);
                        }}
                        aria-label="מחיקה"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ExerciseDetailDialog
        open={!!previewExercise}
        onOpenChange={(open) => !open && setPreviewExercise(null)}
        exercise={previewExercise}
        onEdit={(id) => onView(id)}
      />
    </div>
  );
};

export default ExercisePresetGrid;
