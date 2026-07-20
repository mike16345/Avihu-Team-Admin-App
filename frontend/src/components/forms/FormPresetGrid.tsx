import React, { ReactNode, useMemo, useState } from "react";
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

import DeleteModal from "@/components/Alerts/DeleteModal";
import { FormTypesInHebrew } from "@/constants/form";
import { FormTypes, IForm } from "@/interfaces/IForm";

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
  (form.sections || []).reduce(
    (accumulator, section) => accumulator + (section.questions?.length || 0),
    0
  );

const formatDate = (value?: Date) => {
  if (!value) return null;
  try {
    const date = new Date(value);
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
  const [pendingDeleteForm, setPendingDeleteForm] = useState<IForm | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((form) => {
      if (typeFilter !== "all" && form.type !== typeFilter) return false;
      if (!query) return true;
      return (form.name || "").toLowerCase().includes(query);
    });
  }, [data, search, typeFilter]);

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-4"
      style={{ fontFamily: "Rubik, Heebo, system-ui, sans-serif" }}
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative min-w-[220px] max-w-[360px] flex-1">
          <FaMagnifyingGlass
            size={11}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="חיפוש שאלון…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pr-8 pl-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {TYPE_FILTERS.map((filter) => {
            const active = typeFilter === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setTypeFilter(filter.value)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                  active
                    ? "border-transparent bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                {filter.label}
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

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm dark:bg-slate-800">
            <FaClipboardList size={18} />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-200">
            {data.length === 0 ? "עדיין לא נוצרו שאלונים" : "לא נמצאו תוצאות"}
          </p>
          {data.length === 0 && (
            <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
              צור שאלון התחלה למתאמנים חדשים, שאלון חודשי למעקב, או שאלון מתוזמן לפי בקשה.
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
                className="group relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/40">
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

                  <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (form._id) onView(form._id);
                      }}
                      aria-label="עריכה"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-800 dark:hover:bg-blue-950/40"
                    >
                      <FaPenToSquare size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (form._id) setPendingDeleteForm(form);
                      }}
                      aria-label="מחיקה"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:hover:bg-rose-950/40"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone.bg} ${tone.text} ${tone.border}`}
                  >
                    {tone.icon}
                    {FormTypesInHebrew[form.type]}
                  </span>
                  {form.repeatMonthly && form.type !== "monthly" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <FaRepeat size={9} />
                      חוזר חודשי
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/30">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <FaLayerGroup size={9} />
                      סעיפים
                    </div>
                    <div className="mt-1 text-lg font-bold leading-none text-slate-900 dark:text-slate-100">
                      {sections}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/30">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <FaCircleQuestion size={9} />
                      שאלות
                    </div>
                    <div className="mt-1 text-lg font-bold leading-none text-slate-900 dark:text-slate-100">
                      {questions}
                    </div>
                  </div>
                </div>

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

      <DeleteModal
        isModalOpen={!!pendingDeleteForm}
        setIsModalOpen={(open) => {
          if (!open) setPendingDeleteForm(null);
        }}
        onCancel={() => setPendingDeleteForm(null)}
        onConfirm={() => {
          if (pendingDeleteForm?._id) onDelete(pendingDeleteForm._id);
          setPendingDeleteForm(null);
        }}
        title={
          pendingDeleteForm ? `למחוק את "${pendingDeleteForm.name || "השאלון"}"?` : "למחוק שאלון?"
        }
        alertMessage={
          <>
            השאלון יימחק מרשימת התבניות ולא יהיה זמין לשיוך נוסף.
            <br />
            פעולה זו אינה ניתנת לביטול.
          </>
        }
      />
    </div>
  );
};

export default FormPresetGrid;
