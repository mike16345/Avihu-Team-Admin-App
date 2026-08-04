import { useMemo, useState } from "react";
import type { DietV2OptionMacros } from "@/interfaces/IDietPlanV2";
import { FaDrumstickBite, FaFire, FaSeedling, FaTint } from "react-icons/fa";
import type { IconType } from "react-icons";

interface Props {
  totals: DietV2OptionMacros;
}

const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

const RING_TRACK = "#E5E7EB";

const RING_SIZE = 80;
const RING_STROKE = 7;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const PlanMacroCharts: React.FC<Props> = ({ totals }) => {
  const kcalFromProtein = totals.protein * KCAL_PER_G.protein;
  const kcalFromCarbs = totals.carbs * KCAL_PER_G.carbs;
  const kcalFromFat = totals.fat * KCAL_PER_G.fat;
  const kcalFromMacros = kcalFromProtein + kcalFromCarbs + kcalFromFat;
  const hasMacros = kcalFromMacros > 0;

  const pctOf = (kcal: number): number => (hasMacros ? kcal / kcalFromMacros : 0);

  return (
    <div dir="rtl" className="grid grid-cols-1 gap-3 sm:grid-cols-5">
      <div className="sm:col-span-3">
        <MenuHistoryCard calories={totals.calories} />
      </div>
      <div className="sm:col-span-2">
        <MacroRingsCard
          totals={totals}
          pctProtein={pctOf(kcalFromProtein)}
          pctCarbs={pctOf(kcalFromCarbs)}
          pctFat={pctOf(kcalFromFat)}
        />
      </div>
    </div>
  );
};

interface MenuHistoryCardProps {
  calories: number;
}

interface HistoryPoint {
  dateLabel: string;
  fullDateLabel: string;
  showLabel: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  delta: number;
}

const HISTORY_CHART_WIDTH = 520;
const HISTORY_CHART_HEIGHT = 130;
const HISTORY_PADDING_X = 24;
const HISTORY_PADDING_TOP = 12;
const HISTORY_PADDING_BOTTOM = 30;

const HEBREW_MONTH_SHORT = [
  "ינו׳",
  "פבר׳",
  "מרץ",
  "אפר׳",
  "מאי",
  "יוני",
  "יולי",
  "אוג׳",
  "ספט׳",
  "אוק׳",
  "נוב׳",
  "דצמ׳",
];

const WEEKS_IN_YEAR = 52;
const WEEKLY_WOBBLE_AMPLITUDE = 0.09;

const buildMockHistory = (currentCalories: number): HistoryPoint[] => {
  if (currentCalories <= 0) return [];
  const now = new Date();
  const points: HistoryPoint[] = [];
  let previous = currentCalories;
  let lastLabelledMonth = -1;

  for (let i = 0; i < WEEKS_IN_YEAR; i++) {
    const weeksBack = WEEKS_IN_YEAR - 1 - i;
    const d = new Date(now);
    d.setDate(d.getDate() - weeksBack * 7);
    const isLast = i === WEEKS_IN_YEAR - 1;
    const phase = Math.sin(i * 0.7) * WEEKLY_WOBBLE_AMPLITUDE;
    const value = isLast
      ? currentCalories
      : Math.max(200, Math.round(currentCalories * (1 + phase)));
    const month = d.getMonth();
    const showLabel = month !== lastLabelledMonth;
    if (showLabel) lastLabelledMonth = month;
    points.push({
      dateLabel: HEBREW_MONTH_SHORT[month],
      fullDateLabel: `${d.getDate()}/${month + 1}/${d.getFullYear()}`,
      showLabel,
      calories: value,
      protein: Math.round((value * 0.3) / 4),
      carbs: Math.round((value * 0.45) / 4),
      fat: Math.round((value * 0.25) / 9),
      delta: i === 0 ? 0 : value - previous,
    });
    previous = value;
  }
  return points;
};

const MenuHistoryCard: React.FC<MenuHistoryCardProps> = ({ calories }) => {
  const points = useMemo(() => buildMockHistory(Math.round(calories)), [calories]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <article className="flex h-full flex-col items-start justify-center gap-2 rounded-2xl border border-blue-900/40 bg-white p-5 shadow-sm dark:border-blue-500/40 dark:bg-slate-900">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          תיעוד שינויים בתפריט
        </span>
        <span className="text-sm text-slate-400 dark:text-slate-500">
          אין נתונים עדיין — התיעוד יופיע לאחר שמירת שינוי ראשון
        </span>
      </article>
    );
  }

  if (points.length === 1) {
    const only = points[0];
    return (
      <article className="flex h-full flex-col gap-2 rounded-2xl border border-blue-900/40 bg-white p-4 shadow-sm dark:border-blue-500/40 dark:bg-slate-900">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            תיעוד שינויים בתפריט
          </span>
        </div>
        <div className="relative flex flex-1 flex-col items-center justify-center gap-2" style={{ minHeight: HISTORY_CHART_HEIGHT }}>
          <div
            className="rounded-full border-[3px] border-[#047857] bg-white"
            style={{ width: 16, height: 16, boxShadow: "0 0 0 5px rgba(16,185,129,0.22)" }}
          />
          <div className="flex items-baseline gap-1">
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {only.calories}
            </strong>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">קק״ל</span>
          </div>
          <span className="text-[12px] font-medium text-slate-400 dark:text-slate-500">
            {only.fullDateLabel} · התיעוד הראשון
          </span>
          <span className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            שינויים יופיעו כגרף ככל שתעדכן את התפריט
          </span>
        </div>
      </article>
    );
  }

  const values = points.map((p) => p.calories);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = Math.max(1, maxVal - minVal);

  const usableWidth = HISTORY_CHART_WIDTH - HISTORY_PADDING_X * 2;
  const usableHeight =
    HISTORY_CHART_HEIGHT - HISTORY_PADDING_TOP - HISTORY_PADDING_BOTTOM;

  const projected = points.map((p, i) => {
    const x =
      HISTORY_PADDING_X +
      (points.length === 1 ? usableWidth / 2 : (i / (points.length - 1)) * usableWidth);
    const norm = (p.calories - minVal) / range;
    const y = HISTORY_PADDING_TOP + (1 - norm) * usableHeight;
    return { ...p, x, y };
  });

  const areaBottom = HISTORY_PADDING_TOP + usableHeight;

  const linePath =
    projected.length > 0
      ? `M0,${areaBottom.toFixed(1)} ` +
        projected
          .map((pt) => `L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
          .join(" ")
      : "";

  const areaPath =
    projected.length > 0
      ? `M0,${areaBottom.toFixed(1)} ` +
        projected
          .map((pt) => `L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
          .join(" ") +
        ` L${HISTORY_CHART_WIDTH.toFixed(1)},${areaBottom.toFixed(1)} Z`
      : "";

  return (
    <article className="flex h-full flex-col gap-2 rounded-2xl border border-blue-900/40 bg-white p-4 shadow-sm dark:border-blue-500/40 dark:bg-slate-900">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          תיעוד שינויים בתפריט
        </span>
      </div>

      <div className="relative flex-1" style={{ minHeight: HISTORY_CHART_HEIGHT }}>
        <svg
          viewBox={`0 0 ${HISTORY_CHART_WIDTH} ${HISTORY_CHART_HEIGHT}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="menu-history-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="menu-history-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#menu-history-area)">
            <animate
              attributeName="opacity"
              from="0"
              to="1"
              dur="1.4s"
              begin="0.3s"
              fill="freeze"
            />
          </path>
          <path
            d={linePath}
            fill="none"
            stroke="url(#menu-history-line)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="4000"
            strokeDashoffset="4000"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="4000"
              to="0"
              dur="1.6s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.4 0 0.2 1"
            />
          </path>
        </svg>
        <div
          className="menu-history-dot absolute rounded-full border-2 border-[#047857] bg-white"
          style={{
            left: 0,
            top: `${(areaBottom / HISTORY_CHART_HEIGHT) * 100}%`,
            width: 7,
            height: 7,
            transform: "translate(-50%, -50%)",
            animationDelay: "0ms",
          }}
        />
        {projected.map((pt, i) => {
          const isLatest = i === projected.length - 1;
          const isHovered = hoveredIdx === i;
          const leftPct = (pt.x / HISTORY_CHART_WIDTH) * 100;
          const topPct = (pt.y / HISTORY_CHART_HEIGHT) * 100;
          const baseSize = isLatest ? 12 : 7;
          const size = isHovered ? baseSize + 4 : baseSize;
          const dotColor = isLatest
            ? "#047857"
            : i < projected.length / 2
              ? "#10b981"
              : "#059669";
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx((cur) => (cur === i ? null : cur))}
              className="absolute cursor-pointer rounded-full bg-white transition-all duration-150"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: size,
                height: size,
                transform: "translate(-50%, -50%)",
                borderWidth: isLatest || isHovered ? 3 : 2,
                borderStyle: "solid",
                borderColor: dotColor,
                boxShadow:
                  isHovered || isLatest
                    ? "0 0 0 4px rgba(16, 185, 129, 0.22)"
                    : undefined,
                zIndex: isHovered ? 5 : 2,
              }}
            />
          );
        })}
        {hoveredIdx !== null && (() => {
          const pt = projected[hoveredIdx];
          const leftPct = (pt.x / HISTORY_CHART_WIDTH) * 100;
          const topPct = (pt.y / HISTORY_CHART_HEIGHT) * 100;
          const alignRight = leftPct > 80;
          const alignLeft = leftPct < 20;
          const translateX = alignRight ? "-100%" : alignLeft ? "0%" : "-50%";
          const nudgeX = alignRight ? -6 : alignLeft ? 6 : 0;
          return (
            <div
              className="pointer-events-none absolute z-10 min-w-[168px] rounded-xl border border-emerald-200/70 bg-white p-2.5 shadow-lg shadow-emerald-500/10 dark:border-emerald-800/60 dark:bg-slate-900"
              style={{
                left: `calc(${leftPct}% + ${nudgeX}px)`,
                top: `calc(${topPct}% - 16px)`,
                transform: `translate(${translateX}, -100%)`,
              }}
            >
              <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-1.5 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  שינוי בתפריט
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  {pt.fullDateLabel}
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <strong className="bg-gradient-to-l from-emerald-400 to-emerald-800 bg-clip-text text-[18px] font-extrabold text-transparent">
                  {pt.calories}
                </strong>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  קק״ל
                </span>
                {pt.delta !== 0 && (
                  <span
                    className={`ms-auto text-[10px] font-bold ${
                      pt.delta > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-500 dark:text-rose-400"
                    }`}
                  >
                    {pt.delta > 0 ? "+" : "−"}
                    {Math.abs(pt.delta)}
                  </span>
                )}
              </div>
              <div className="mt-1 grid grid-cols-3 gap-1 text-center">
                <TooltipStat label="חלבון" value={pt.protein} />
                <TooltipStat label="פחמימה" value={pt.carbs} />
                <TooltipStat label="שומן" value={pt.fat} />
              </div>
            </div>
          );
        })()}
        {projected.map((pt, i) =>
          pt.showLabel ? (
            <span
              key={`lbl-${i}`}
              className="absolute -translate-x-1/2 text-[12px] font-semibold text-slate-400 dark:text-slate-500"
              style={{ left: `${(pt.x / HISTORY_CHART_WIDTH) * 100}%`, bottom: 2 }}
            >
              {pt.dateLabel}
            </span>
          ) : null,
        )}
      </div>
    </article>
  );
};

interface MacroRingsCardProps {
  totals: DietV2OptionMacros;
  pctProtein: number;
  pctCarbs: number;
  pctFat: number;
}

const MacroRingsCard: React.FC<MacroRingsCardProps> = ({
  totals,
  pctProtein,
  pctCarbs,
  pctFat,
}) => {
  const [view, setView] = useState<"rings" | "bars">("bars");
  const toggleView = () => setView((v) => (v === "rings" ? "bars" : "rings"));

  return (
    <article
      onDoubleClick={toggleView}
      title="לחיצה כפולה מחליפה תצוגה"
      className="flex cursor-pointer select-none flex-col gap-2 rounded-2xl border border-blue-900/40 bg-white p-4 shadow-sm dark:border-blue-500/40 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          יחסי מאקרו
        </span>
        <span className="text-[10px] font-medium text-slate-300 dark:text-slate-600">
          דאבל־קליק להחלפה
        </span>
      </div>
      {view === "rings" ? (
        <div className="flex items-stretch justify-around gap-1 pt-1">
          <MacroRing
            label="קלוריות"
            value={Math.round(totals.calories)}
            percent={totals.calories > 0 ? 1 : 0}
            unit="קל'"
            Icon={FaFire}
          />
          <MacroRing
            label="חלבון"
            value={Math.round(totals.protein)}
            percent={pctProtein}
            unit="גרם"
            Icon={FaDrumstickBite}
          />
          <MacroRing
            label="פחמימה"
            value={Math.round(totals.carbs)}
            percent={pctCarbs}
            unit="גרם"
            Icon={FaSeedling}
          />
          <MacroRing
            label="שומן"
            value={Math.round(totals.fat)}
            percent={pctFat}
            unit="גרם"
            Icon={FaTint}
          />
        </div>
      ) : (
        <MacroBarsView
          totals={totals}
          pctProtein={pctProtein}
          pctCarbs={pctCarbs}
          pctFat={pctFat}
        />
      )}
      <MacroRatiosFooter
        kcalProtein={Math.round(totals.protein * KCAL_PER_G.protein)}
        kcalCarbs={Math.round(totals.carbs * KCAL_PER_G.carbs)}
        kcalFat={Math.round(totals.fat * KCAL_PER_G.fat)}
      />
    </article>
  );
};

const MacroRatiosFooter: React.FC<{
  kcalProtein: number;
  kcalCarbs: number;
  kcalFat: number;
}> = ({ kcalProtein, kcalCarbs, kcalFat }) => (
  <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-slate-200/70 pt-2 text-[12px] font-medium text-slate-500 dark:border-slate-700/60 dark:text-slate-400">
    <RatioText label="חלבון" kcal={kcalProtein} />
    <span className="text-slate-300 dark:text-slate-600" aria-hidden>
      |
    </span>
    <RatioText label="פחמימה" kcal={kcalCarbs} />
    <span className="text-slate-300 dark:text-slate-600" aria-hidden>
      |
    </span>
    <RatioText label="שומן" kcal={kcalFat} />
  </div>
);

const RatioText: React.FC<{ label: string; kcal: number }> = ({ label, kcal }) => (
  <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
    <span>{label}</span>
    <span className="text-slate-400 dark:text-slate-500">·</span>
    <span className="font-semibold text-slate-600 dark:text-slate-300">{kcal}</span>
    <span className="text-[10px] text-slate-400 dark:text-slate-500">קק״ל</span>
  </span>
);

const TooltipStat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-md bg-emerald-50/60 px-1.5 py-1 dark:bg-emerald-950/30">
    <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </div>
    <div className="text-[12px] font-bold text-slate-800 dark:text-slate-100">
      {value}
      <span className="ms-0.5 text-[9px] font-medium text-slate-500 dark:text-slate-400">
        ג׳
      </span>
    </div>
  </div>
);

interface MacroRingProps {
  label: string;
  value: number;
  percent: number;
  unit: string;
  Icon: IconType;
}

const RING_GRADIENT_LIGHT = "#86efac";
const RING_GRADIENT_DARK = "#047857";

const MacroRing: React.FC<MacroRingProps> = ({ label, value, percent, unit, Icon }) => {
  const clamped = Math.max(0, Math.min(1, percent));
  const offset = RING_CIRCUMFERENCE * (1 - clamped);
  const gradientId = useMemo(
    () => `ring-grad-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg width={RING_SIZE} height={RING_SIZE} className="absolute inset-0">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={RING_GRADIENT_LIGHT} />
              <stop offset="100%" stopColor={RING_GRADIENT_DARK} />
            </linearGradient>
          </defs>
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={RING_TRACK}
            strokeWidth={RING_STROKE}
            fill="none"
            className="dark:stroke-slate-700"
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke={`url(#${gradientId})`}
            strokeWidth={RING_STROKE}
            fill="none"
            strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[15px] font-bold leading-none text-slate-900 dark:text-slate-100">
            {value}
          </span>
          <span className="mt-0.5 text-[9px] font-medium text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </span>
        <Icon size={11} style={{ color: RING_GRADIENT_DARK }} />
      </div>
    </div>
  );
};

const BIG_RING_SIZE = 118;
const BIG_RING_STROKE = 11;
const BIG_RING_RADIUS = (BIG_RING_SIZE - BIG_RING_STROKE) / 2;
const BIG_RING_CIRC = 2 * Math.PI * BIG_RING_RADIUS;

const BigCalorieRing: React.FC<{ calories: number }> = ({ calories }) => {
  const gradientId = useMemo(
    () => `big-ring-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );
  return (
    <div className="flex shrink-0 items-center justify-center">
      <div className="relative" style={{ width: BIG_RING_SIZE, height: BIG_RING_SIZE }}>
        <svg width={BIG_RING_SIZE} height={BIG_RING_SIZE} className="absolute inset-0">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={RING_GRADIENT_LIGHT} />
              <stop offset="100%" stopColor={RING_GRADIENT_DARK} />
            </linearGradient>
            <filter id={`${gradientId}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="1.5"
                stdDeviation="2.5"
                floodColor={RING_GRADIENT_DARK}
                floodOpacity="0.35"
              />
            </filter>
          </defs>
          <circle
            cx={BIG_RING_SIZE / 2}
            cy={BIG_RING_SIZE / 2}
            r={BIG_RING_RADIUS}
            stroke={RING_TRACK}
            strokeWidth={BIG_RING_STROKE}
            fill="none"
            className="dark:stroke-slate-800"
          />
          <circle
            cx={BIG_RING_SIZE / 2}
            cy={BIG_RING_SIZE / 2}
            r={BIG_RING_RADIUS}
            stroke={`url(#${gradientId})`}
            strokeWidth={BIG_RING_STROKE}
            fill="none"
            strokeDasharray={`${BIG_RING_CIRC} ${BIG_RING_CIRC}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(-90 ${BIG_RING_SIZE / 2} ${BIG_RING_SIZE / 2})`}
            filter={`url(#${gradientId}-shadow)`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600/80 dark:text-emerald-400/80">
            <FaFire size={9} />
            קלוריות
          </span>
          <span className="mt-0.5 text-[26px] font-extrabold leading-none text-slate-900 dark:text-slate-100">
            {calories}
          </span>
          <span className="mt-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
            קל'
          </span>
        </div>
      </div>
    </div>
  );
};

const AdminMacroBar: React.FC<{
  label: string;
  grams: number;
  pct: number;
  Icon: IconType;
}> = ({ label, grams, pct, Icon }) => {
  const p = Math.round(pct * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Icon size={12} style={{ color: RING_GRADIENT_DARK }} />
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
            {label}
          </span>
        </div>
        <span className="text-[12px] text-slate-500 dark:text-slate-400">
          {Math.round(grams)} גרם · {p}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(0, Math.min(100, p))}%`,
            backgroundImage: `linear-gradient(to left, ${RING_GRADIENT_LIGHT}, ${RING_GRADIENT_DARK})`,
          }}
        />
      </div>
    </div>
  );
};

const MacroBarsView: React.FC<MacroRingsCardProps> = ({
  totals,
  pctProtein,
  pctCarbs,
  pctFat,
}) => (
  <div className="flex items-center gap-5 pt-1">
    <div className="flex flex-1 flex-col gap-3.5">
      <AdminMacroBar label="חלבון" grams={totals.protein} pct={pctProtein} Icon={FaDrumstickBite} />
      <AdminMacroBar label="פחמימה" grams={totals.carbs} pct={pctCarbs} Icon={FaSeedling} />
      <AdminMacroBar label="שומן" grams={totals.fat} pct={pctFat} Icon={FaTint} />
    </div>
    <BigCalorieRing calories={Math.round(totals.calories)} />
  </div>
);

export default PlanMacroCharts;
