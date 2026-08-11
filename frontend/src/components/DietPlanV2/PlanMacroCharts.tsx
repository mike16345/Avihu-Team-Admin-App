import { useMemo, useState } from "react";
import type { DietV2MealMacros } from "@/interfaces/IDietPlanV2";
import { FaDrumstickBite, FaFire, FaSeedling, FaTint } from "react-icons/fa";
import type { IconType } from "react-icons";

interface Props {
  totals: DietV2MealMacros;
  freeCalories?: number;
}

const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

const RING_TRACK = "#E5E7EB";

const RING_SIZE = 80;
const RING_STROKE = 7;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const PlanMacroCharts: React.FC<Props> = ({ totals, freeCalories = 0 }) => {
  const kcalFromProtein = totals.protein * KCAL_PER_G.protein;
  const kcalFromCarbs = totals.carbs * KCAL_PER_G.carbs;
  const kcalFromFat = totals.fat * KCAL_PER_G.fat;
  const kcalFromMacros = kcalFromProtein + kcalFromCarbs + kcalFromFat;
  const hasMacros = kcalFromMacros > 0;

  const pctOf = (kcal: number): number => (hasMacros ? kcal / kcalFromMacros : 0);

  return (
    <div dir="rtl">
      <MacroRingsCard
        totals={totals}
        freeCalories={freeCalories}
        pctProtein={pctOf(kcalFromProtein)}
        pctCarbs={pctOf(kcalFromCarbs)}
        pctFat={pctOf(kcalFromFat)}
      />
    </div>
  );
};

interface MacroRingsCardProps {
  totals: DietV2MealMacros;
  freeCalories: number;
  pctProtein: number;
  pctCarbs: number;
  pctFat: number;
}

const MacroRingsCard: React.FC<MacroRingsCardProps> = ({
  totals,
  freeCalories,
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
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">יחסי מאקרו</span>
        <div className="flex items-center gap-2">
          {freeCalories > 0 && (
            <span className="rounded-full border border-dashed border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
              + {Math.round(freeCalories)} קק״ל חופשי
            </span>
          )}
          <span className="text-[10px] font-medium text-slate-300 dark:text-slate-600">
            דאבל־קליק להחלפה
          </span>
        </div>
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
          freeCalories={freeCalories}
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
  const gradientId = useMemo(() => `ring-grad-${Math.random().toString(36).slice(2, 9)}`, []);

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
  const gradientId = useMemo(() => `big-ring-${Math.random().toString(36).slice(2, 9)}`, []);
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

const MacroBarsView: React.FC<MacroRingsCardProps> = ({ totals, pctProtein, pctCarbs, pctFat }) => (
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
