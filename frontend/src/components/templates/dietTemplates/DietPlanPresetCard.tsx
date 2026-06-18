import React from "react";
import {
  FaArrowLeft,
  FaBreadSlice,
  FaDroplet,
  FaDrumstickBite,
  FaFire,
  FaPenToSquare,
  FaTrash,
  FaUser,
  FaUtensils,
} from "react-icons/fa6";
import {
  dietaryRestrictionLabel,
  dietaryRestrictionTone,
  dietGoalLabel,
  dietGoalTone,
} from "@/lib/dietMeta";
import DietFavoriteStar from "./DietFavoriteStar";
import { DietPresetItem } from "./dietPlanPresetGridUtils";

type DietPlanPresetCardProps = {
  preset: DietPresetItem;
  builderName?: string;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
};

const MACRO_TONE: Record<"rose" | "amber" | "sky", { bg: string; text: string }> = {
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-700 dark:text-sky-300",
  },
};

const getPresetSubtitle = (goalLabel?: string, calories?: number) =>
  [goalLabel, calories ? `${calories} קל׳` : null].filter(Boolean).join(" · ");

const hasMacroStats = (preset: DietPresetItem) =>
  Boolean(preset.proteinServings || preset.carbServings || preset.fatServings);

const hasEmptyMeta = (preset: DietPresetItem, goalLabel?: string) =>
  !goalLabel &&
  typeof preset.calories !== "number" &&
  !preset.proteinServings &&
  !preset.carbServings &&
  !preset.fatServings &&
  (preset.dietaryRestrictions ?? []).length === 0;

const MacroStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: number;
  tone: "rose" | "amber" | "sky";
}> = ({ icon, label, value, tone }) => {
  const toneStyle = MACRO_TONE[tone];
  const displayValue = typeof value === "number" ? value : "—";

  return (
    <div className={`flex flex-col items-center gap-0.5 rounded-lg ${toneStyle.bg} p-2`}>
      <div
        className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${toneStyle.text}`}
      >
        {icon}
        {label}
      </div>
      <div className={`text-lg font-bold leading-none ${toneStyle.text}`}>{displayValue}</div>
    </div>
  );
};

const DietPlanPresetCard: React.FC<DietPlanPresetCardProps> = ({
  preset,
  builderName,
  onOpen,
  onDelete,
}) => {
  const goalTone = dietGoalTone(preset.goal);
  const goalLabel = dietGoalLabel(preset.goal);
  const restrictions = preset.dietaryRestrictions ?? [];
  const presetSubtitle = getPresetSubtitle(goalLabel, preset.calories);
  const shouldShowSubtitle = Boolean(presetSubtitle);
  const shouldShowMacroStats = hasMacroStats(preset);
  const shouldShowEmptyMeta = hasEmptyMeta(preset, goalLabel);

  const handleOpen = () => {
    if (preset._id) onOpen(preset._id);
  };

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (preset._id && confirm(`למחוק את "${preset.name}"?`)) onDelete(preset._id);
  };

  return (
    <article
      onClick={handleOpen}
      className="group relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/40">
            <FaUtensils size={14} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
              {preset.name || "ללא שם"}
            </h3>
            {shouldShowSubtitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{presetSubtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <DietFavoriteStar presetId={preset._id} />
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleOpen();
              }}
              aria-label="עריכה"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-800 dark:hover:bg-blue-950/40"
            >
              <FaPenToSquare size={11} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              aria-label="מחיקה"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/40"
            >
              <FaTrash size={11} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {goalLabel && goalTone && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${goalTone.bg} ${goalTone.text} ${goalTone.border}`}
          >
            {goalLabel}
          </span>
        )}
        {typeof preset.calories === "number" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <FaFire size={9} />
            {preset.calories} קל׳
          </span>
        )}
      </div>

      {shouldShowMacroStats && (
        <div className="grid grid-cols-3 gap-2">
          <MacroStat
            icon={<FaDrumstickBite size={9} />}
            label="חלבון"
            value={preset.proteinServings}
            tone="rose"
          />
          <MacroStat
            icon={<FaBreadSlice size={9} />}
            label="פחמ׳"
            value={preset.carbServings}
            tone="amber"
          />
          <MacroStat
            icon={<FaDroplet size={9} />}
            label="שומן"
            value={preset.fatServings}
            tone="sky"
          />
        </div>
      )}

      {restrictions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {restrictions.map((restriction) => (
            <span
              key={restriction}
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${dietaryRestrictionTone.bg} ${dietaryRestrictionTone.text} ${dietaryRestrictionTone.border}`}
            >
              {dietaryRestrictionLabel(restriction)}
            </span>
          ))}
        </div>
      )}

      {shouldShowEmptyMeta && (
        <p className="text-[11px] italic text-slate-400">
          לא הוגדרו תיוגים — פתח לעריכה והוסף מטרה, קלוריות והגבלות
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[10px] text-slate-400 dark:text-slate-500">
        {builderName ? (
          <span className="inline-flex items-center gap-1">
            <FaUser size={8} />
            בנה: {builderName}
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 font-semibold transition-colors group-hover:text-blue-500">
          פתח לעריכה
          <FaArrowLeft size={8} />
        </span>
      </div>
    </article>
  );
};

export default DietPlanPresetCard;
