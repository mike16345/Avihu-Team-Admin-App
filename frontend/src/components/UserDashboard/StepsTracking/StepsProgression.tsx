import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowTrendDown,
  FaArrowTrendUp,
  FaBullseye,
  FaChevronLeft,
  FaChevronRight,
  FaFire,
  FaMinus,
  FaRocket,
} from "react-icons/fa6";

import {
  buildMockStepsDataset,
  estimateCaloriesFromSteps,
  type DailySteps,
  type StepsWeek,
  type TraineeBiometrics,
} from "./stepsProgressionUtils";

const DAY_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"] as const;

const formatNumber = (value: number) => value.toLocaleString("he-IL");

const StepsProgression = () => {
  const dataset = useMemo(() => buildMockStepsDataset(), []);
  const [weekIndex, setWeekIndex] = useState(dataset.weeks.length - 1);

  const week = dataset.weeks[weekIndex];

  const isCurrentWeek = weekIndex === dataset.weeks.length - 1;
  const canGoBack = weekIndex > 0;
  const canGoForward = weekIndex < dataset.weeks.length - 1;

  const goPrev = () => canGoBack && setWeekIndex((i) => i - 1);
  const goNext = () => canGoForward && setWeekIndex((i) => i + 1);

  const previousWeek = weekIndex > 0 ? dataset.weeks[weekIndex - 1] : null;

  return (
    <div dir="rtl" className="flex flex-col gap-5 font-heebo">
      <WeeklyKpiStrip
        week={week}
        previousWeek={previousWeek}
        trainee={dataset.trainee}
        isCurrentWeek={isCurrentWeek}
      />

      <SyncBadge hoursAgo={dataset.lastSyncedHoursAgo} />

      <WeekChartCard
        week={week}
        weekIndex={weekIndex}
        totalWeeks={dataset.weeks.length}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onPrev={goPrev}
        onNext={goNext}
        trainee={dataset.trainee}
      />

      <WeeklyGoalsStrip
        weeks={dataset.weeks}
        activeIndex={weekIndex}
        onSelect={setWeekIndex}
        trainee={dataset.trainee}
      />
    </div>
  );
};

export default StepsProgression;

/* ===================== Weekly KPI strip ===================== */

function WeeklyKpiStrip({
  week,
  previousWeek,
  trainee,
  isCurrentWeek,
}: {
  week: StepsWeek;
  previousWeek: StepsWeek | null;
  trainee: TraineeBiometrics;
  isCurrentWeek: boolean;
}) {
  // Pick "today" = the latest day in the week that has sync + actual
  // activity. For historical weeks the last day of the week is used.
  const todayIdx = isCurrentWeek
    ? week.days.reduce(
        (best, day, idx) => (day.hadSync && day.steps > 0 ? idx : best),
        -1
      )
    : week.days.length - 1;
  const today = todayIdx >= 0 ? week.days[todayIdx] : week.days[week.days.length - 1];
  const todaySteps = today?.steps ?? 0;

  const weekTotal = week.days.reduce((acc, day) => acc + day.steps, 0);
  const weekPct = Math.round((weekTotal / week.weeklyGoal) * 100);
  const weekRemaining = Math.max(0, week.weeklyGoal - weekTotal);
  const overshoot = Math.max(0, weekTotal - week.weeklyGoal);
  const overshootCalories = estimateCaloriesFromSteps(overshoot, trainee);

  const prevTotal = previousWeek
    ? previousWeek.days.reduce((acc, day) => acc + day.steps, 0)
    : 0;
  const deltaSteps = previousWeek ? weekTotal - prevTotal : 0;
  const deltaPct = previousWeek && prevTotal > 0 ? Math.round((deltaSteps / prevTotal) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {/* 1 — Daily step goal vs today */}
      <KpiTile
        label={isCurrentWeek ? "יעד צעדים יומי" : "יעד צעדים יומי · סיום שבוע"}
        icon={<FaBullseye size={12} className="text-blue-600" />}
        value={formatNumber(todaySteps)}
        unit="צעדים"
        secondary={`מתוך ${formatNumber(week.dailyGoal)} · ${
          week.dailyGoal ? Math.round((todaySteps / week.dailyGoal) * 100) : 0
        }%`}
        progressPct={
          week.dailyGoal ? Math.min(100, Math.round((todaySteps / week.dailyGoal) * 100)) : 0
        }
        tone="blue"
      />

      {/* 2 — Weekly goal */}
      <KpiTile
        label="יעד שבועי"
        icon={<FaBullseye size={12} className="text-blue-600" />}
        value={`${formatNumber(weekTotal)}`}
        unit="צעדים"
        secondary={`מתוך ${formatNumber(week.weeklyGoal)} · ${weekPct}%`}
        progressPct={Math.min(100, weekPct)}
        tone={weekPct >= 100 ? "emerald" : "blue"}
      />

      {/* 3 — Weekly overshoot (always shown; zero when not exceeded) */}
      <KpiTile
        label="חריגה שבועית"
        icon={
          <FaRocket
            size={12}
            className={overshoot > 0 ? "text-emerald-600" : "text-slate-400"}
          />
        }
        value={`${overshoot > 0 ? "+" : ""}${formatNumber(overshoot)}`}
        unit="צעדים"
        secondary={
          overshoot > 0
            ? `≈ +${formatNumber(overshootCalories)} קלוריות נוספות`
            : `עדיין לא חרג מהיעד · נשארו ${formatNumber(weekRemaining)} צעדים`
        }
        tone={overshoot > 0 ? "emerald" : "slate"}
        highlight={overshoot > 0}
      />

      {/* 4 — Trend vs previous week */}
      {previousWeek ? (
        <KpiTile
          label="מגמה מול שבוע שעבר"
          icon={
            deltaSteps > 0 ? (
              <FaArrowTrendUp size={12} className="text-emerald-600" />
            ) : deltaSteps < 0 ? (
              <FaArrowTrendDown size={12} className="text-rose-600" />
            ) : (
              <FaMinus size={10} className="text-slate-400" />
            )
          }
          value={`${deltaSteps > 0 ? "+" : ""}${formatNumber(deltaSteps)}`}
          unit="צעדים"
          secondary={
            deltaSteps === 0
              ? "ללא שינוי"
              : `${deltaPct > 0 ? "+" : ""}${deltaPct}% לעומת שבוע שעבר`
          }
          tone={deltaSteps > 0 ? "emerald" : deltaSteps < 0 ? "rose" : "slate"}
        />
      ) : (
        <KpiTile
          label="קלוריות שבועי"
          icon={<FaFire size={12} className="text-rose-500" />}
          value={formatNumber(estimateCaloriesFromSteps(weekTotal, trainee))}
          unit="קל׳"
          secondary="סה״כ קלוריות שנשרפו השבוע"
          tone="rose"
        />
      )}
    </div>
  );
}

type KpiTone = "blue" | "rose" | "emerald" | "slate";

const TONE_STYLES: Record<KpiTone, { value: string; progress: string; surface: string }> = {
  blue: {
    value: "text-blue-700 dark:text-blue-300",
    progress: "brand-gradient",
    surface: "border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900",
  },
  rose: {
    value: "text-rose-700 dark:text-rose-300",
    progress: "bg-gradient-to-r from-rose-500 to-rose-400",
    surface: "border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900",
  },
  emerald: {
    value: "text-emerald-700 dark:text-emerald-300",
    progress: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    surface: "border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900",
  },
  slate: {
    value: "text-slate-700 dark:text-slate-200",
    progress: "bg-slate-300 dark:bg-slate-600",
    surface: "border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900",
  },
};

function KpiTile({
  label,
  icon,
  value,
  unit,
  secondary,
  progressPct,
  tone,
  highlight,
}: {
  label: string;
  icon: JSX.Element;
  value: string;
  unit?: string;
  secondary?: string;
  progressPct?: number;
  tone: KpiTone;
  highlight?: boolean;
}) {
  const t = TONE_STYLES[tone];
  return (
    <div
      className={`flex flex-col gap-1.5 rounded-2xl border px-4 py-3 shadow-sm ${
        highlight
          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30"
          : t.surface
      }`}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-extrabold ${t.value}`}>{value}</span>
        {unit && (
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{unit}</span>
        )}
      </div>
      {secondary && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{secondary}</p>
      )}
      {typeof progressPct === "number" && (
        <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className={`h-full rounded-full ${t.progress}`} style={{ width: `${progressPct}%` }} />
        </div>
      )}
    </div>
  );
}

/* ===================== Sync badge ===================== */

function SyncBadge({ hoursAgo }: { hoursAgo: number }) {
  const isFresh = hoursAgo <= 6;
  const isStale = hoursAgo > 24;
  const label =
    hoursAgo < 1
      ? "כעת"
      : hoursAgo < 24
        ? `לפני ${hoursAgo} שעות`
        : `לפני יותר מ-${Math.floor(hoursAgo / 24)} ימים`;
  const tone = isStale
    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300"
    : isFresh
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300"
      : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300";

  return (
    <div
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      נסנכרן {label}
    </div>
  );
}

/* ===================== Week chart with navigation ===================== */

function WeekChartCard({
  week,
  weekIndex,
  totalWeeks,
  canGoBack,
  canGoForward,
  onPrev,
  onNext,
  trainee,
}: {
  week: StepsWeek;
  weekIndex: number;
  totalWeeks: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onPrev: () => void;
  onNext: () => void;
  trainee: TraineeBiometrics;
}) {
  const maxBar = Math.max(week.dailyGoal * 1.2, ...week.days.map((day) => day.steps));

  return (
    <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* In RTL "previous" sits visually on the right edge. The
              chevron points right (back-in-time) → uses ChevronRight. */}
          <NavArrow
            ariaLabel="שבוע קודם"
            onClick={onPrev}
            disabled={!canGoBack}
            icon={<FaChevronRight size={11} />}
          />
          <div className="text-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {week.label}
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {week.startDate} – {week.endDate}
            </p>
          </div>
          <NavArrow
            ariaLabel="שבוע הבא"
            onClick={onNext}
            disabled={!canGoForward}
            icon={<FaChevronLeft size={11} />}
          />
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:text-blue-300">
          <FaBullseye size={9} />
          שבוע {weekIndex + 1} מתוך {totalWeeks}
        </div>
      </div>

      <WeekBars
        days={week.days}
        dailyGoal={week.dailyGoal}
        maxBar={maxBar}
        trainee={trainee}
      />
    </section>
  );
}

function NavArrow({
  onClick,
  disabled,
  icon,
  ariaLabel,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: JSX.Element;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700 disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:border-slate-200"
    >
      {icon}
    </button>
  );
}

function WeekBars({
  days,
  dailyGoal,
  maxBar,
  trainee,
}: {
  days: DailySteps[];
  dailyGoal: number;
  maxBar: number;
  trainee: TraineeBiometrics;
}) {
  const goalLinePct = Math.min(96, (dailyGoal / maxBar) * 100);

  return (
    <div>
      {/* Plot area — 7-column grid, absolute-positioned bars from
          bottom of each cell. Avoids the flex-1 + height-% pitfall
          that caused the bars to collapse. Each bar is a thin
          column; the number sits in a chip right above the bar tip. */}
      <div className="relative h-56 w-full">
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-dashed border-blue-400"
          style={{ bottom: `${goalLinePct}%` }}
        >
          <span className="absolute end-0 -translate-y-1/2 rounded-md bg-blue-100 px-2.5 py-1 text-[12px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            יעד יומי · {formatNumber(dailyGoal)}
          </span>
        </div>

        <div className="grid h-full grid-cols-7 gap-4 px-1">
          {days.map((day, idx) => (
            <DayColumn
              key={idx}
              day={day}
              dailyGoal={dailyGoal}
              maxBar={maxBar}
              trainee={trainee}
            />
          ))}
        </div>
      </div>

      {/* Day labels — bigger, bolder, easier to read */}
      <div className="mt-3 grid grid-cols-7 gap-4 px-1">
        {days.map((_, idx) => (
          <div key={idx} className="flex items-center justify-center">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {DAY_LABELS[idx]}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded bg-gradient-to-t from-blue-600 to-blue-500" />
          הגיע ליעד
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded bg-gradient-to-t from-emerald-500 to-emerald-400" />
          חריגה חיובית
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded bg-slate-300 dark:bg-slate-600" />
          לא הגיע ליעד
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded bg-rose-200 dark:bg-rose-900/40" />
          יום אפס
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded border border-dashed border-slate-400 bg-slate-100 dark:bg-slate-800" />
          אין סינכרון
        </span>
      </div>
    </div>
  );
}

function DayColumn({
  day,
  dailyGoal,
  maxBar,
  trainee,
}: {
  day: DailySteps;
  dailyGoal: number;
  maxBar: number;
  trainee: TraineeBiometrics;
}) {
  const noData = !day.hadSync;
  const heightPct = maxBar
    ? Math.max(day.steps > 0 ? 4 : noData ? 2 : 2, (day.steps / maxBar) * 100)
    : 0;
  const extra = Math.max(0, day.steps - dailyGoal);
  const base = Math.min(day.steps, dailyGoal);
  const basePctOfBar = day.steps > 0 ? (base / day.steps) * 100 : 0;
  const extraPctOfBar = day.steps > 0 ? (extra / day.steps) * 100 : 0;
  const hit = day.steps >= dailyGoal;

  // Thin "candle" bar centred in its grid cell. Absolute positioning
  // from the bottom guarantees the percentage height resolves against
  // a definite parent height (the h-56 plot area).
  return (
    <div className="relative h-full">
      {/* number chip pinned above the bar's top */}
      <div
        className="absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap"
        style={{ bottom: `calc(${heightPct}% + 4px)` }}
      >
        {noData ? (
          <span className="text-[13px] font-bold text-slate-400 dark:text-slate-500">—</span>
        ) : day.steps === 0 ? (
          <span className="text-[13px] font-bold text-rose-600 dark:text-rose-400">0</span>
        ) : (
          <span
            className={`text-[13px] font-bold ${
              hit ? "text-emerald-700 dark:text-emerald-300" : "text-slate-700 dark:text-slate-200"
            }`}
          >
            {formatNumber(day.steps)}
            {extra > 0 && (
              <span className="ms-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                (+{formatNumber(extra)})
              </span>
            )}
          </span>
        )}
      </div>

      {/* thin bar, absolute from cell bottom — centred + max width */}
      <div
        className="absolute bottom-0 left-1/2 w-full max-w-[28px] -translate-x-1/2"
        style={{ height: `${heightPct}%` }}
        title={
          noData
            ? "אין נתוני סינכרון"
            : `${formatNumber(day.steps)} צעדים · ≈ ${formatNumber(
                estimateCaloriesFromSteps(day.steps, trainee)
              )} קלוריות`
        }
      >
        {noData ? (
          <div className="h-full w-full rounded-t-lg border border-dashed border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800/60" />
        ) : day.steps === 0 ? (
          <div className="h-full w-full rounded-t-lg bg-rose-200 dark:bg-rose-900/40" />
        ) : (
          <div className="flex h-full w-full flex-col-reverse overflow-hidden rounded-t-lg shadow-sm">
            <div
              className={
                hit
                  ? "bg-gradient-to-t from-blue-600 to-blue-500"
                  : "bg-slate-300 dark:bg-slate-600"
              }
              style={{ height: `${basePctOfBar}%` }}
            />
            {extra > 0 && (
              <div
                className="bg-gradient-to-t from-emerald-500 to-emerald-400"
                style={{ height: `${extraPctOfBar}%` }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== Weekly goals strip ===================== */

function WeeklyGoalsStrip({
  weeks,
  activeIndex,
  onSelect,
  trainee,
}: {
  weeks: StepsWeek[];
  activeIndex: number;
  onSelect: (index: number) => void;
  trainee: TraineeBiometrics;
}) {
  // Horizontal-scroll strip — all weeks live in one flex row,
  // overflow scrolls. When the active week changes (via chart
  // arrows), scroll the corresponding card into view.
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const card = cardRefs.current[activeIndex];
    if (card) {
      card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeIndex]);

  return (
    <div
      ref={scrollerRef}
      className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2"
      style={{ scrollbarWidth: "thin" }}
    >
      {weeks.map((week, idx) => {
        const total = week.days.reduce((acc, day) => acc + day.steps, 0);
        const percent = Math.round((total / week.weeklyGoal) * 100);
        const overshoot = Math.max(0, total - week.weeklyGoal);
        const overshootCalories = estimateCaloriesFromSteps(overshoot, trainee);
        const totalCalories = estimateCaloriesFromSteps(total, trainee);
        const isActive = idx === activeIndex;
        const hit = percent >= 100;
        const progressClamped = Math.min(100, percent);

        return (
          <button
            key={idx}
            ref={(el) => (cardRefs.current[idx] = el)}
            type="button"
            onClick={() => onSelect(idx)}
            className={`group flex shrink-0 basis-[calc((100%-2.25rem)/4)] snap-start flex-col gap-2 rounded-2xl border px-4 py-3 text-right transition-all hover:-translate-y-0.5 hover:shadow-md ${
              isActive
                ? "border-blue-400 bg-blue-50 shadow-md shadow-blue-500/10 dark:border-blue-700 dark:bg-blue-950/40"
                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <p
                className={`text-[12px] font-bold ${
                  isActive
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                {week.label}
              </p>
              {hit && (
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                  יעד הושג
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {week.startDate} – {week.endDate}
            </p>

            <dl className="flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800 pt-1.5">
              <GoalRow label="יעד שבועי" value={formatNumber(week.weeklyGoal)} suffix="צעדים" />
              <GoalRow label="יעד יומי" value={formatNumber(week.dailyGoal)} suffix="צעדים" />
            </dl>

            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300">
                  הושלם
                </span>
                <span
                  className={`text-xl font-extrabold ${
                    hit
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {percent}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${hit ? "bg-emerald-500" : "brand-gradient"}`}
                  style={{ width: `${progressClamped}%` }}
                />
              </div>
            </div>

            {overshoot > 0 && (
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-2">
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  חריגה חיובית
                </p>
                <p className="mt-1 text-[12px] font-bold text-emerald-700 dark:text-emerald-300">
                  +<span className="font-extrabold">{formatNumber(overshoot)}</span> צעדים{" "}
                  <span className="mx-1 text-emerald-400">≈</span>{" "}
                  +<span className="font-extrabold">{formatNumber(overshootCalories)}</span>{" "}
                  קלוריות
                </p>
              </div>
            )}

            <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-2 text-[12px] text-slate-600 dark:text-slate-300">
              <span aria-hidden="true" className="text-sm">🔥</span>
              <span>
                ≈{" "}
                <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                  {formatNumber(totalCalories)}
                </span>{" "}
                <span className="font-bold">קלוריות נשרפו</span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function GoalRow({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[12px] font-bold text-slate-600 dark:text-slate-300">{label}</dt>
      <dd className="flex items-baseline gap-1">
        <span className="text-[16px] font-extrabold text-slate-900 dark:text-slate-100">
          {value}
        </span>
        {suffix && (
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
            {suffix}
          </span>
        )}
      </dd>
    </div>
  );
}

