import React from "react";
import { IWorkoutPlanPreset } from "@/interfaces/IWorkoutPlan";
import {
  goalLabel,
  goalTone,
  levelLabel,
  levelTone,
  muscleFocusLabel,
  equipmentLabel,
  equipmentTone,
} from "@/lib/workoutMeta";
import {
  FaDumbbell,
  FaClock,
  FaCalendarWeek,
  FaSignal,
  FaBullseye,
  FaPenToSquare,
  FaTrash,
  FaArrowLeft,
  FaNoteSticky,
  FaPersonRays,
} from "react-icons/fa6";
import FavoriteStar from "./FavoriteStar";

interface WorkoutPresetCardProps {
  preset: IWorkoutPlanPreset & { _id?: string };
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

const getWorkoutsPerWeek = (preset: IWorkoutPlanPreset) => {
  if (typeof preset.workoutsPerWeek === "number") return preset.workoutsPerWeek;
  return 0;
};

const getMuscleFocusClassName = (muscle: string) => {
  if (muscle === "full-body") {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300";
  }

  return "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300";
};

const getPresetSubtitle = (level: string | undefined, goal: string | undefined) =>
  [level, goal].filter(Boolean).join(" · ");

const WorkoutPresetCard: React.FC<WorkoutPresetCardProps> = ({ preset, onOpen, onDelete }) => {
  const workoutsPerWeek = getWorkoutsPerWeek(preset);
  const duration = preset.durationMinutes;
  const lvlTone = levelTone(preset.level);
  const lvlLabel = levelLabel(preset.level);
  const goTone = goalTone(preset.goal);
  const goLabel = goalLabel(preset.goal);

  const hasNote = !!preset.note?.trim();
  const hasLimitations = !!preset.limitations?.trim();
  const muscleFocus = preset.muscleFocus ?? [];
  const eqLabel = equipmentLabel(preset.equipment);
  const eqTone = equipmentTone(preset.equipment);
  const presetSubtitle = getPresetSubtitle(lvlLabel, goLabel);
  const hasPresetSubtitle = Boolean(presetSubtitle);
  const hasEmptyMeta = workoutsPerWeek === 0 && !duration && !lvlLabel && !goLabel;

  return (
    <div
      dir="rtl"
      onClick={() => preset._id && onOpen(preset._id)}
      className="group relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 font-heebo shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60 dark:ring-blue-900/40">
            <FaDumbbell size={14} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
              {preset.name || "ללא שם"}
            </h3>
            {hasPresetSubtitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{presetSubtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <FavoriteStar presetId={preset._id} />
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                preset._id && onOpen(preset._id);
              }}
              aria-label="עריכה"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40"
            >
              <FaPenToSquare size={11} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (preset._id && confirm(`למחוק את "${preset.name}"?`)) onDelete(preset._id);
              }}
              aria-label="מחיקה"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
            >
              <FaTrash size={11} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {workoutsPerWeek > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200">
            <FaCalendarWeek size={10} />
            {workoutsPerWeek}× בשבוע
          </span>
        )}
        {duration && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200">
            <FaClock size={10} />
            {duration} דק׳
          </span>
        )}
        {lvlLabel && lvlTone && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${lvlTone.bg} ${lvlTone.text} ${lvlTone.border}`}
          >
            <FaSignal size={10} />
            {lvlLabel}
          </span>
        )}
        {goLabel && goTone && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${goTone.bg} ${goTone.text} ${goTone.border}`}
          >
            <FaBullseye size={10} />
            {goLabel}
          </span>
        )}
        {eqLabel && eqTone && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${eqTone.bg} ${eqTone.text} ${eqTone.border}`}
          >
            <FaDumbbell size={10} />
            {eqLabel}
          </span>
        )}
      </div>

      {muscleFocus.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <FaPersonRays size={10} className="text-slate-400" />
          {muscleFocus.map((m) => {
            return (
              <span
                key={m}
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${getMuscleFocusClassName(
                  m
                )}`}
              >
                {muscleFocusLabel(m)}
              </span>
            );
          })}
        </div>
      )}

      {hasNote && (
        <div className="flex gap-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-2.5">
          <FaNoteSticky size={11} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{preset.note}</p>
        </div>
      )}

      {hasLimitations && (
        <div className="flex gap-2 rounded-lg border border-rose-100 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-2.5">
          <span className="mt-0.5 shrink-0 text-rose-500 text-xs font-bold">⚠</span>
          <p className="line-clamp-2 text-xs text-rose-700 dark:text-rose-300">
            {preset.limitations}
          </p>
        </div>
      )}

      {hasEmptyMeta && (
        <p className="text-[11px] text-slate-400 italic">
          לא הוגדרו מאפיינים — פתח לעריכה והוסף תדירות, רמה, ודגש
        </p>
      )}

      <div className="mt-auto flex items-center justify-end gap-1 pt-1 text-[10px] font-semibold text-slate-300 dark:text-slate-600 transition-colors group-hover:text-blue-500">
        <span>פתח לעריכה</span>
        <FaArrowLeft size={9} className="transition-transform group-hover:-translate-x-0.5" />
      </div>
    </div>
  );
};

export default WorkoutPresetCard;
