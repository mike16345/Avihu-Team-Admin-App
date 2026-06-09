/**
 * FormPresetGrid — card grid for questionnaire presets.
 *
 * Replaces the basic data-table on the "שאלונים" tab. Shows a name,
 * a colored type badge (התחלה / חודשי / מתוזמן), section + question
 * counts, last-updated date, and hover edit/delete actions — same
 * design language as WorkoutPresetGrid / SimplePresetGrid.
 */
import React, { ReactNode, useMemo, useState } from "react";
import { IForm, FormTypes } from "@/interfaces/IForm";
import { FormTypesInHebrew } from "@/constants/form";
import {
  FaMagnifyingGlass,
  FaPenToSquare,
  FaTrash,
  FaClipboardList,
  FaLayerGroup,
  FaCircleQuestion,
  FaCalendarCheck,
  FaRepeat,
  FaPlay,
} from "react-icons/fa6";

interface FormPresetGridProps {
  data: IForm[];
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  actionButton?: ReactNode;
}

const TYPE_TONE: Record<FormTypes, { icon: ReactNode; bg: string; text: string; border: string }> =
  {
    onboarding: {
      icon: <FaPlay size={9} />,
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-900/60",
    },
    monthly: {
      icon: <FaRepeat size={9} />,
      bg: "bg-violet-50 dark:bg-violet-950/40",
      text: "text-violet-700 dark:text-violet-300",
      border: "border-violet-200 dark:border-violet-900/60",
    },
    general: {
      icon: <FaCalendarCheck size={9} />,
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-900/60",
    },
  };

const TYPE_FILTERS: { value: FormTypes | "all"; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "onboarding", label: "התחלה" },
  { value: "monthly", label: "חודשי" },
  { value: "general", label: "מתוזמן" },
];

const countQuestions = (form: IForm) =>
  (form.sections || []).reduce((acc, s) => acc + (s.questions?.length || 0), 0);

const formatDate = (d?: Date) => {
  if (!d) return null;
  try {
    const date = new Date(d);
    return new Intl.DateTimeFormat("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return null;
  }
};

const FormPresetGrid: React.FC<FormPresetGridProps> = ({
  data,
  onView,
  onDelete,
  actionButton,
}) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FormTypes | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((f) => {
      if (typeFilter !== "all" && f.type !== typeFilter) return false;
      if (!q) return true;
      return (f.name || "").toLowerCase().includes(q);
    });
  }, [data, search, typeFilter]);

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-4"
      style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
    >
      {/* Toolbar */}
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
            placeholder="חיפוש שאלון…"
            className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 pr-8 pl-3 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900"
          />
        </div>

        {/* Type filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {TYPE_FILTERS.map((t) => {
            const active = typeFilter === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTypeFilter(t.value)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                  active
                    ? "border-transparent bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          {filtered.length} {filtered.length === 1 ? "שאלון" : "שאלונים"}
          {filtered.length !== data.length && ` מתוך ${data.length}`}
        </span>

        <div className="ms-auto">{actionButton}</div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 shadow-sm">
            <FaClipboardList size={18} />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
            {data.length === 0 ? "עדיין לא נוצרו שאלונים" : "לא נמצאו תוצאות"}
          </p>
          {data.length === 0 && (
            <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
              צור שאלון התחלה למתאמנים חדשים, שאלון חודשי למעקב, או שאלון מתוזמן לפי בקשה
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((form) => {
            const tone = TYPE_TONE[form.type];
            const sections = form.sections?.length || 0;
            const questions = countQuestions(form);
            const updated = formatDate(form.updatedAt) || formatDate(form.createdAt);

            return (
              <article
                key={form._id}
                onClick={() => form._id && onView(form._id)}
                className="group relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 ring-1 ring-blue-200/60 dark:ring-blue-900/40">
                      <FaClipboardList size={14} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-slate-900 dark:text-slate-100">
                        {form.name || "שאלון ללא שם"}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {sections} {sections === 1 ? "סעיף" : "סעיפים"} · {questions}{" "}
                        {questions === 1 ? "שאלה" : "שאלות"}
                      </p>
                    </div>
                  </div>

                  {/* Hover actions */}
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        form._id && onView(form._id);
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
                        if (form._id && confirm(`למחוק את "${form.name || "השאלון"}"?`)) {
                          onDelete(form._id);
                        }
                      }}
                      aria-label="מחיקה"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                </div>

                {/* Type badge */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone.bg} ${tone.text} ${tone.border}`}
                  >
                    {tone.icon}
                    {FormTypesInHebrew[form.type]}
                  </span>
                  {form.repeatMonthly && form.type !== "monthly" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      <FaRepeat size={9} />
                      חוזר חודשי
                    </span>
                  )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <FaLayerGroup size={9} />
                      סעיפים
                    </div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
                      {sections}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-2.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <FaCircleQuestion size={9} />
                      שאלות
                    </div>
                    <div className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">
                      {questions}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[10px] text-slate-400 dark:text-slate-500">
                  {updated ? <span>עודכן {updated}</span> : <span />}
                  <span className="font-semibold transition-colors group-hover:text-blue-500">
                    פתח לעריכה ←
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FormPresetGrid;
