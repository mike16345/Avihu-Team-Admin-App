/**
 * ProgressNoteContainer
 *
 * Two views inside the flip-overlay of the weight chart:
 *
 *  - LIST view (default): a prominent "+ פתק חדש" CTA at the top, then a
 *    scrollable list of past notes grouped visually as cards. Empty state
 *    has its own design.
 *
 *  - FORM view (after clicking the CTA, or the pencil on an existing note):
 *    the form replaces the list; "← חזרה לרשימה" returns.
 */
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi2";
import { FaPlus, FaRegFileLines } from "react-icons/fa6";
import { FaStickyNote } from "react-icons/fa";
import Note from "./Note";
import ProgressNoteForm from "./ProgressNoteForm";
import useProgressNoteQuery from "@/hooks/queries/progressNote/useProgressNoteQuery";
import { useProgressNoteContext } from "@/context/useProgressNoteContext";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";

const ProgressNoteContainer = () => {
  const { id } = useParams();
  const {
    setOpenProgressSheet,
    openProgressSheet,
    handleCloseProgressSheet,
    progressNote,
  } = useProgressNoteContext();
  const { data: progressNoteRes, isError, isLoading, error } = useProgressNoteQuery(id);

  const noteCount = progressNoteRes?.data?.progressNotes?.length ?? 0;

  const notes = useMemo(() => {
    if (!noteCount) return [];
    return progressNoteRes!.data!.progressNotes!.map((note) => (
      <Note key={note._id} progressNote={note} className="bg-white" />
    ));
  }, [progressNoteRes?.data, noteCount]);

  if (isLoading) return <Loader size="medium" />;
  if (isError && error?.status !== 404) return <ErrorPage />;

  // FORM view (add / edit)
  if (openProgressSheet) {
    return (
      <div dir="rtl" className="flex h-full flex-col">
        <div className="mb-3 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={handleCloseProgressSheet}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <HiArrowRight size={14} />
            <span>חזרה לרשימה</span>
          </button>
          <div className="text-right">
            <h4 className="text-base font-bold text-slate-900">
              {progressNote ? "עריכת פתק" : "פתק חדש"}
            </h4>
            <p className="text-[11px] text-slate-400">
              {progressNote
                ? "ערוך את הנתונים ולחץ שמור."
                : "תאריך, אחוזי ביצוע ותוכן חופשי. כל השדות אופציונליים."}
            </p>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/40 p-3">
          <ProgressNoteForm />
        </div>
      </div>
    );
  }

  // LIST view (default)
  return (
    <div dir="rtl" className="flex h-full flex-col gap-3">
      {/* Top CTA — primary action */}
      <button
        type="button"
        onClick={() => setOpenProgressSheet(true)}
        className="group flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-gradient-to-l from-blue-50 to-white px-4 py-3 text-right shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <FaPlus size={13} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">הוסף פתק חדש</p>
            <p className="text-[11px] text-slate-500">תיעוד תזונה / אימונים / אירובי + הערות</p>
          </div>
        </div>
        <FaStickyNote size={20} className="text-amber-400/80" />
      </button>

      {/* Past notes */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FaRegFileLines size={12} className="text-slate-400" />
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              פתקים קודמים
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            {noteCount === 0 ? "אין פתקים" : `${noteCount} פתקים`}
          </span>
        </div>

        {noteCount === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-6 text-center">
            <FaStickyNote size={26} className="text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">אין פתקים עדיין</p>
            <p className="max-w-xs text-xs text-slate-400">
              לחץ "הוסף פתק חדש" למעלה כדי לתעד את הפתק הראשון של המתאמן.
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pl-1">{notes}</div>
        )}
      </div>
    </div>
  );
};

export default ProgressNoteContainer;
