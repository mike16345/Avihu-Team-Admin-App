import { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FaArrowTrendDown, FaArrowTrendUp, FaScaleBalanced, FaCalendarDay } from "react-icons/fa6";
import { FaStickyNote } from "react-icons/fa";
import { HiOutlineX } from "react-icons/hi";
import { useWeighInsApi } from "@/hooks/api/useWeighInsApi";
import { WeightChart } from "./WeightChart";
import { WeightCalendar } from "./WeightCalendar";
import ProgressNoteWrapper from "../ProgressNotes/ProgressNoteWrapper";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { HOUR_STALE_TIME } from "@/constants/constants";
import { cn, createRetryFunction } from "@/lib/utils";
import { QueryKeys } from "@/enums/QueryKeys";
import DateUtils from "@/lib/dateUtils";
import { IWeighIn } from "@/interfaces/IWeighIns";

export const WeightProgression = () => {
  const { id } = useParams();
  const { getWeighInsByUserId } = useWeighInsApi();
  const [notesOpen, setNotesOpen] = useState(false);
  const lastClickAtRef = useRef(0);
  const lastToggleAtRef = useRef(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Callback ref instead of useRef+useEffect: useEffect with [] deps
  // ran during isLoading when the chart div didn't exist yet, so the
  // listeners never attached. A callback ref runs the instant the div
  // mounts (and again with null on unmount), regardless of when in
  // the render lifecycle that happens.
  //
  // Two detection paths attached together:
  //   • Native `dblclick` — fires reliably on plain DOM (notes view,
  //     empty-state chart placeholder).
  //   • Manual click-counter (350ms window) — needed because Recharts
  //     swaps the click target between the two clicks, so the browser
  //     never emits `dblclick` over the chart line/tooltip layer.
  // 250ms toggle cooldown prevents both paths from firing twice.
  const setCardRef = useCallback((card: HTMLDivElement | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!card) return;

    const isIgnoredTarget = (target: HTMLElement | null) => {
      if (!target) return false;
      if (target.closest?.("[data-notes-close]")) return true;
      const tag = target.tagName;
      if (tag && ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "LABEL"].includes(tag)) return true;
      if (target.closest?.(".ql-editor, .ql-toolbar")) return true;
      return false;
    };

    const toggle = () => {
      const now = Date.now();
      if (now - lastToggleAtRef.current < 250) return;
      lastToggleAtRef.current = now;
      setNotesOpen((v) => !v);
    };

    const onClick = (e: MouseEvent) => {
      if (isIgnoredTarget(e.target as HTMLElement | null)) {
        lastClickAtRef.current = 0;
        return;
      }
      const now = Date.now();
      if (now - lastClickAtRef.current < 350) {
        lastClickAtRef.current = 0;
        toggle();
      } else {
        lastClickAtRef.current = now;
      }
    };

    const onDblClick = (e: MouseEvent) => {
      if (isIgnoredTarget(e.target as HTMLElement | null)) return;
      toggle();
    };

    card.addEventListener("click", onClick);
    card.addEventListener("dblclick", onDblClick);
    cleanupRef.current = () => {
      card.removeEventListener("click", onClick);
      card.removeEventListener("dblclick", onDblClick);
    };
  }, []);

  const { data, error, isLoading } = useQuery({
    queryKey: [QueryKeys.WEIGH_INS + id],
    staleTime: HOUR_STALE_TIME * 6,
    enabled: !!id,
    queryFn: () => getWeighInsByUserId(id!),
    retry: createRetryFunction(404),
  });

  const allWeighIns = useMemo(() => (data || []) as IWeighIn[], [data]);
  const [period, setPeriod] = useState<"month" | "3months" | "all">("month");

  const weighIns = useMemo(() => {
    if (period === "all") return allWeighIns;
    const days = period === "month" ? 30 : 90;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return allWeighIns.filter((w) => new Date(w.date).getTime() >= cutoff);
  }, [allWeighIns, period]);

  const stats = useMemo(() => {
    if (!weighIns.length) return null;
    const sorted = [...weighIns].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const change = +(last.weight - first.weight).toFixed(1);
    const lastDate = DateUtils.formatDate(DateUtils.convertToDate(last.date), "DD/MM/YYYY");
    return {
      current: last.weight,
      starting: first.weight,
      change,
      lastDate,
      totalRecords: sorted.length,
    };
  }, [weighIns]);

  if (isLoading) return <Loader size="large" />;
  if (error && (error as any)?.status !== 404) return <ErrorPage message={error as any} />;

  const isEmpty = !weighIns.length;

  const isLoss = (stats?.change || 0) < 0;
  const changeColor = isLoss
    ? "text-[#48A868]"
    : stats?.change === 0
      ? "text-[#1D2939] dark:text-slate-100"
      : "text-rose-500";

  return (
    <div dir="rtl" className="flex flex-col gap-6 font-heebo">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<FaScaleBalanced size={14} className="text-[#667085]" />}
          label="משקל נוכחי"
          value={stats ? `${stats.current} ק״ג` : "—"}
          accent="text-[#1D2939] dark:text-slate-50"
        />
        <StatCard
          icon={<FaScaleBalanced size={14} className="text-[#667085]" />}
          label="משקל התחלתי"
          value={stats ? `${stats.starting} ק״ג` : "—"}
          accent="text-[#1D2939] dark:text-slate-50"
        />
        <StatCard
          icon={
            isLoss ? (
              <FaArrowTrendDown size={14} className="text-[#48A868]" />
            ) : (
              <FaArrowTrendUp size={14} className="text-[#667085]" />
            )
          }
          label="שינוי"
          value={stats ? `${stats.change > 0 ? "+" : ""}${stats.change} ק״ג` : "—"}
          accent={stats ? changeColor : "text-slate-400"}
        />
        <StatCard
          icon={<FaCalendarDay size={14} className="text-[#667085]" />}
          label="שקילה אחרונה"
          value={stats?.lastDate || "—"}
          accent="text-[#1D2939] dark:text-slate-50"
        />
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[300px_1fr]">
        <div className="flex h-full flex-col rounded-[20px] border border-[#E8EDF2] dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-[0_4px_20px_rgba(30,50,70,0.04)]">
          <div className="mb-4 flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-[#1D2939] dark:text-slate-50">לוח שנה</h3>
            <p className="text-xs text-[#667085]">שקילות שבוצעו בחודש</p>
          </div>
          <div className="flex flex-1 items-start justify-center">
            <WeightCalendar weighIns={weighIns} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-[#E8EDF2] pt-3 text-[10px] text-[#667085]">
            <span className="inline-flex items-center gap-1.5">
              <span className="block h-1.5 w-1.5 rounded-full bg-[#7DB7E8]" />
              שקילה בוצעה
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="block h-1.5 w-1.5 rounded-full bg-[#DCEAF3]" />
              חסרה שקילה
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="block h-1.5 w-1.5 rounded-full bg-[#E8EDF2]" />
              אין נתונים
            </span>
          </div>
        </div>

        <div
          ref={setCardRef}
          className="relative flex h-full flex-col overflow-hidden rounded-[20px] border border-[#E8EDF2] dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-[0_4px_20px_rgba(30,50,70,0.04)] select-none"
          title={notesOpen ? "לחץ פעמיים לחזרה לגרף" : "לחץ פעמיים לפתקי התקדמות"}
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#1D2939] dark:text-slate-50">
                  {notesOpen ? "פתקי התקדמות" : "גרף משקל"}
                </h3>
                <span className="hidden items-center gap-1 rounded-full bg-[#F7F9FB] dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-[#667085] sm:inline-flex">
                  <FaStickyNote size={9} className="text-[#7DB7E8]" />
                  {notesOpen ? "לחץ פעמיים לחזרה לגרף" : "לחץ פעמיים לפתקים"}
                </span>
              </div>
              <p className="text-xs text-[#667085]">מעקב אחר השינוי במשקל לאורך זמן</p>
            </div>
            <div className="flex items-center gap-2">
              {!notesOpen && !isEmpty && (
                <div className="inline-flex items-center gap-0.5 rounded-full border border-[#E8EDF2] bg-white dark:bg-slate-900 p-0.5">
                  {(["month", "3months", "all"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={cn(
                        "rounded-full px-3 py-0.5 text-[11px] font-medium transition-colors",
                        period === p
                          ? "bg-[#EAF2F7] text-[#1D2939]"
                          : "text-[#667085] hover:text-[#1D2939]"
                      )}
                    >
                      {p === "month" ? "חודש" : p === "3months" ? "3 חודשים" : "הכל"}
                    </button>
                  ))}
                </div>
              )}
              {!notesOpen && !isEmpty && (
                <span className="rounded-full bg-[#EAF2F7] dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-[#1D2939] dark:text-slate-200">
                  {stats?.totalRecords} שקילות
                </span>
              )}
              {notesOpen && (
                <button
                  type="button"
                  data-notes-close
                  onClick={() => setNotesOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[#667085] hover:bg-[#F7F9FB] hover:text-[#1D2939]"
                  aria-label="סגור"
                >
                  <HiOutlineX size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="relative flex-1 min-h-[320px]">
            <div
              className={`absolute inset-0 transition-all duration-300 ${
                notesOpen ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              <WeightChart weighIns={weighIns} />
            </div>

            <div
              className={`absolute inset-0 transition-all duration-300 ${
                notesOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-2 opacity-0"
              }`}
            >
              <ProgressNoteWrapper />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#E8EDF2] dark:border-slate-800/80 bg-white dark:bg-slate-900 px-5 py-4 shadow-[0_4px_20px_rgba(30,50,70,0.04)]">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[12px] font-medium text-[#667085] dark:text-slate-400">{label}</p>
      </div>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${accent}`}>{value}</p>
    </div>
  );
}
