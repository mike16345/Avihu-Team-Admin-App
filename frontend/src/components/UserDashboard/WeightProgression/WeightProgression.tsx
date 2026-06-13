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
import { createRetryFunction } from "@/lib/utils";
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

  const weighIns = useMemo(() => (data || []) as IWeighIn[], [data]);

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
    ? "text-emerald-600"
    : stats?.change === 0
      ? "text-slate-700 dark:text-slate-200"
      : "text-rose-600";
  const changeBg = isLoss
    ? "bg-emerald-50 dark:bg-emerald-950/40"
    : stats?.change === 0
      ? "bg-slate-50 dark:bg-slate-800"
      : "bg-rose-50 dark:bg-rose-950/40";

  return (
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={<FaScaleBalanced size={14} className="text-blue-600" />}
          label="משקל נוכחי"
          value={stats ? `${stats.current} ק״ג` : "—"}
          accent="text-blue-600"
        />
        <StatCard
          icon={<FaScaleBalanced size={14} className="text-slate-400 dark:text-slate-500" />}
          label="משקל התחלתי"
          value={stats ? `${stats.starting} ק״ג` : "—"}
          accent="text-slate-700 dark:text-slate-200"
        />
        <StatCard
          icon={
            isLoss ? (
              <FaArrowTrendDown size={14} className="text-emerald-600" />
            ) : (
              <FaArrowTrendUp size={14} className="text-rose-600" />
            )
          }
          label="שינוי"
          value={stats ? `${stats.change > 0 ? "+" : ""}${stats.change} ק״ג` : "—"}
          accent={stats ? changeColor : "text-slate-400"}
          bg={stats ? changeBg : "bg-white dark:bg-slate-900"}
        />
        <StatCard
          icon={<FaCalendarDay size={14} className="text-indigo-600" />}
          label="שקילה אחרונה"
          value={stats?.lastDate || "—"}
          accent="text-slate-700 dark:text-slate-200"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-slate-800 dark:text-slate-100">לוח שנה</h3>
          <WeightCalendar weighIns={weighIns} />
        </div>

        <div
          ref={setCardRef}
          className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 shadow-sm select-none"
          title={notesOpen ? "לחץ פעמיים לחזרה לגרף" : "לחץ פעמיים לפתקי התקדמות"}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {notesOpen ? "פתקי התקדמות" : "גרף משקל"}
              </h3>
              <span className="hidden items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:inline-flex">
                <FaStickyNote size={9} className="text-amber-500" />
                {notesOpen ? "לחץ פעמיים לחזרה לגרף" : "לחץ פעמיים לפתקים"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!notesOpen &&
                (isEmpty ? (
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    אין נתונים עדיין
                  </span>
                ) : (
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                    {stats?.totalRecords} שקילות
                  </span>
                ))}
              {notesOpen && (
                <button
                  type="button"
                  data-notes-close
                  onClick={() => setNotesOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="סגור"
                >
                  <HiOutlineX size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="relative min-h-[500px]">
            <div
              className={`h-[500px] w-full transition-all duration-300 ${
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
  bg = "bg-white dark:bg-slate-900",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  bg?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200/80 dark:border-slate-800/80 ${bg} p-3 shadow-sm`}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
      <p className={`mt-1 text-lg font-bold ${accent}`}>{value}</p>
    </div>
  );
}
