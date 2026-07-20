import type { DietV2OptionMacros } from "@/interfaces/IDietPlanV2";

interface Props {
  totals: DietV2OptionMacros;
}

const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

const MACRO_COLORS = {
  protein: "#3b82f6", // blue-500
  carbs: "#f59e0b", // amber-500
  fat: "#f43f5e", // rose-500
} as const;

const PlanMacroCharts: React.FC<Props> = ({ totals }) => {
  const kcalFromProtein = totals.protein * KCAL_PER_G.protein;
  const kcalFromCarbs = totals.carbs * KCAL_PER_G.carbs;
  const kcalFromFat = totals.fat * KCAL_PER_G.fat;
  const kcalFromMacros = kcalFromProtein + kcalFromCarbs + kcalFromFat;
  const hasMacros = kcalFromMacros > 0;

  const pct = (n: number) => (hasMacros ? Math.round((n / kcalFromMacros) * 100) : 0);
  const pctProtein = pct(kcalFromProtein);
  const pctCarbs = pct(kcalFromCarbs);
  const pctFat = pct(kcalFromFat);

  return (
    <div dir="rtl" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="sm:col-span-2">
        <CalorieHeroCard
          calories={totals.calories}
          kcalFromProtein={kcalFromProtein}
          kcalFromCarbs={kcalFromCarbs}
          kcalFromFat={kcalFromFat}
          hasMacros={hasMacros}
        />
      </div>
      <MacroRatioCard
        pctProtein={pctProtein}
        pctCarbs={pctCarbs}
        pctFat={pctFat}
        gProtein={totals.protein}
        gCarbs={totals.carbs}
        gFat={totals.fat}
        hasMacros={hasMacros}
      />
    </div>
  );
};

interface CalorieHeroProps {
  calories: number;
  kcalFromProtein: number;
  kcalFromCarbs: number;
  kcalFromFat: number;
  hasMacros: boolean;
}

const CalorieHeroCard: React.FC<CalorieHeroProps> = ({
  calories,
  kcalFromProtein,
  kcalFromCarbs,
  kcalFromFat,
  hasMacros,
}) => {
  const total = kcalFromProtein + kcalFromCarbs + kcalFromFat;
  const proteinW = total > 0 ? (kcalFromProtein / total) * 100 : 0;
  const carbsW = total > 0 ? (kcalFromCarbs / total) * 100 : 0;
  const fatW = total > 0 ? (kcalFromFat / total) * 100 : 0;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            סך קלוריות
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <strong className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
              {Math.round(calories)}
            </strong>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              קק״ל
            </span>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
          {hasMacros ? "מקור אנרגיה" : "אין נתונים"}
        </span>
      </div>

      <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {hasMacros ? (
          <>
            <span
              style={{ width: `${proteinW}%`, backgroundColor: MACRO_COLORS.protein }}
              title={`חלבון · ${Math.round(kcalFromProtein)} קק״ל`}
            />
            <span
              style={{ width: `${carbsW}%`, backgroundColor: MACRO_COLORS.carbs }}
              title={`פחמימות · ${Math.round(kcalFromCarbs)} קק״ל`}
            />
            <span
              style={{ width: `${fatW}%`, backgroundColor: MACRO_COLORS.fat }}
              title={`שומן · ${Math.round(kcalFromFat)} קק״ל`}
            />
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] font-semibold text-slate-600 dark:text-slate-300">
        <LegendDot color={MACRO_COLORS.protein} label="חלבון" grams={Math.round(kcalFromProtein)} unit="קק״ל" />
        <LegendDot color={MACRO_COLORS.carbs} label="פחמימות" grams={Math.round(kcalFromCarbs)} unit="קק״ל" />
        <LegendDot color={MACRO_COLORS.fat} label="שומן" grams={Math.round(kcalFromFat)} unit="קק״ל" />
      </div>
    </article>
  );
};

interface MacroRatioProps {
  pctProtein: number;
  pctCarbs: number;
  pctFat: number;
  gProtein: number;
  gCarbs: number;
  gFat: number;
  hasMacros: boolean;
}

const MacroRatioCard: React.FC<MacroRatioProps> = ({
  pctProtein,
  pctCarbs,
  pctFat,
  gProtein,
  gCarbs,
  gFat,
  hasMacros,
}) => {
  const R = 40;
  const C = 2 * Math.PI * R;
  const dash = (fraction: number) => `${fraction * C} ${C}`;
  const fProtein = pctProtein / 100;
  const fCarbs = pctCarbs / 100;
  const fFat = pctFat / 100;

  return (
    <article className="flex items-center justify-center gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
      <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
        <svg viewBox="-52 -52 104 104" className="h-28 w-28 -rotate-90">
          <circle
            r={R}
            fill="none"
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth={12}
          />
          {hasMacros && (
            <>
              <circle
                r={R}
                fill="none"
                stroke={MACRO_COLORS.protein}
                strokeWidth={12}
                strokeDasharray={dash(fProtein)}
                strokeDashoffset={0}
                strokeLinecap="butt"
              />
              <circle
                r={R}
                fill="none"
                stroke={MACRO_COLORS.carbs}
                strokeWidth={12}
                strokeDasharray={dash(fCarbs)}
                strokeDashoffset={-fProtein * C}
                strokeLinecap="butt"
              />
              <circle
                r={R}
                fill="none"
                stroke={MACRO_COLORS.fat}
                strokeWidth={12}
                strokeDasharray={dash(fFat)}
                strokeDashoffset={-(fProtein + fCarbs) * C}
                strokeLinecap="butt"
              />
            </>
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {hasMacros ? "פילוח" : "—"}
          </span>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          יחסי מאקרו
        </span>
        <MacroLegendRow color={MACRO_COLORS.protein} label="חלבון" pct={pctProtein} grams={gProtein} />
        <MacroLegendRow color={MACRO_COLORS.carbs} label="פחמימות" pct={pctCarbs} grams={gCarbs} />
        <MacroLegendRow color={MACRO_COLORS.fat} label="שומן" pct={pctFat} grams={gFat} />
      </div>
    </article>
  );
};

const LegendDot: React.FC<{ color: string; label: string; grams: number; unit: string }> = ({
  color,
  label,
  grams,
  unit,
}) => (
  <span className="inline-flex items-center gap-1.5">
    <span
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
    <span>{label}</span>
    <strong className="font-extrabold text-slate-800 dark:text-slate-100">{grams}</strong>
    <span className="text-[11px] text-slate-400 dark:text-slate-500">{unit}</span>
  </span>
);

const MacroLegendRow: React.FC<{ color: string; label: string; pct: number; grams: number }> = ({
  color,
  label,
  pct,
  grams,
}) => (
  <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
    <span className="min-w-[56px]">{label}</span>
    <strong className="min-w-[36px] text-slate-900 dark:text-slate-100">{pct}%</strong>
    <span className="text-xs text-slate-500 dark:text-slate-400">
      {grams} <span className="text-[11px] text-slate-400 dark:text-slate-500">גרם</span>
    </span>
  </div>
);

export default PlanMacroCharts;
