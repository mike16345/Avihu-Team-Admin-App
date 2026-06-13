import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { IDietPlan, DietGoal, DietaryRestriction, IMeal } from "@/interfaces/IDietPlan";
import { dietGoalOptions, dietGoalTone, dietaryRestrictionOptions } from "@/lib/dietMeta";
import { useUsersStore } from "@/store/userStore";
import { useSubTrainersQuery } from "@/hooks/queries/subTrainers/useSubTrainersQuery";
import {
  FaFire,
  FaDrumstickBite,
  FaBreadSlice,
  FaDroplet,
  FaUser,
  FaBullseye,
  FaCircleExclamation,
  FaUtensils,
  FaCircleInfo,
  FaCarrot,
} from "react-icons/fa6";

type MetaForm = IDietPlan & {
  goal?: DietGoal;
  calories?: number;
  proteinServings?: number;
  carbServings?: number;
  fatServings?: number;
  dietaryRestrictions?: DietaryRestriction[];
  builtByTrainerId?: string;
};

const CALORIES_PER_SERVING = {
  protein: 150,
  carbs: 120,
  fats: 100,
  veggies: 30,
} as const;

const calculateTotalCalories = ({
  protein,
  carbs,
  fats,
  veggies,
  freeCalories,
}: {
  protein: number;
  carbs: number;
  fats: number;
  veggies: number;
  freeCalories: number;
}) =>
  Math.round(
    protein * CALORIES_PER_SERVING.protein +
      carbs * CALORIES_PER_SERVING.carbs +
      fats * CALORIES_PER_SERVING.fats +
      veggies * CALORIES_PER_SERVING.veggies +
      freeCalories
  );

const DietPlanMetaPanel: React.FC = () => {
  const form = useFormContext<MetaForm>();
  const { watch, setValue } = form;

  const goal = watch("goal");
  const meals = (watch("meals") ?? []) as IMeal[];
  const freeCalories = watch("freeCalories") ?? 0;
  const restrictions = watch("dietaryRestrictions") ?? [];
  const builtBy = watch("builtByTrainerId");

  const sumServings = (key: "totalProtein" | "totalCarbs" | "totalFats" | "totalVeggies") =>
    meals.reduce((acc, m) => acc + Number(m?.[key]?.quantity ?? 0), 0);
  const protein = sumServings("totalProtein");
  const carbs = sumServings("totalCarbs");
  const fats = sumServings("totalFats");
  const veggies = sumServings("totalVeggies");

  const totalCalories = calculateTotalCalories({
    protein,
    carbs,
    fats,
    veggies,
    freeCalories: Number(freeCalories || 0),
  });

  useEffect(() => {
    setValue("proteinServings", protein || undefined, { shouldDirty: true });
    setValue("carbServings", carbs || undefined, { shouldDirty: true });
    setValue("fatServings", fats || undefined, { shouldDirty: true });
    setValue("calories", totalCalories || undefined, { shouldDirty: true });
    setValue("totalCalories", totalCalories || undefined, { shouldDirty: true });
  }, [protein, carbs, fats, totalCalories, setValue]);

  const currentUser = useUsersStore((s) => s.currentUser);
  const { data: subTrainers = [] } = useSubTrainersQuery();

  const builderOptions = React.useMemo(() => {
    const list: { value: string; label: string }[] = [];
    if (currentUser?._id) {
      const name = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
      const fallback = currentUser.email || "אני";
      list.push({
        value: currentUser._id,
        label: name ? `${name} (אני)` : `${fallback} (אני)`,
      });
    }
    subTrainers.forEach((t) => {
      if (t._id && t._id !== currentUser?._id) {
        list.push({ value: t._id, label: t.fullName || "ללא שם" });
      }
    });
    return list;
  }, [currentUser, subTrainers]);

  const setFreeCalories = (v: string) => {
    const n = v.trim() === "" ? 0 : Number(v);
    setValue("freeCalories", Number.isFinite(n) ? (n as number) : 0, { shouldDirty: true });
  };

  const toggleRestriction = (r: DietaryRestriction) => {
    const next = restrictions.includes(r)
      ? restrictions.filter((x) => x !== r)
      : [...restrictions, r];
    setValue("dietaryRestrictions", next, { shouldDirty: true });
  };

  return (
    <div
      dir="rtl"
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 font-['Rubik','Heebo',system-ui,sans-serif] shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300">
          <FaBullseye size={12} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">תיוג תפריט</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            עוזר לסנן ולמצוא את התפריט הנכון לכל מתאמן
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2 md:divide-x md:divide-slate-100 md:dark:divide-slate-800 md:rtl:divide-x-reverse">
        <div className="flex flex-col gap-3 md:pl-5">
          <Field label="מספר ארוחות" icon={<FaUtensils size={9} />} hint="מחושב אוטומטית">
            <div className="flex h-9 w-fit min-w-[3rem] items-center justify-center rounded-xl bg-emerald-50 px-3 text-base font-bold tabular-nums text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60">
              {meals.length}
            </div>
          </Field>

          <Field label="מטרה" icon={<FaBullseye size={9} />}>
            <div className="flex flex-wrap gap-1.5">
              {dietGoalOptions.map((o) => {
                const t = dietGoalTone(o.value);
                const active = goal === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() =>
                      setValue("goal", active ? undefined : o.value, { shouldDirty: true })
                    }
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                      active
                        ? `${t?.bg} ${t?.text} ${t?.border}`
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-300"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="קלוריות חופשיות" icon={<FaCircleInfo size={9} />}>
            <input
              type="number"
              min={0}
              max={5000}
              value={freeCalories || ""}
              onChange={(e) => setFreeCalories(e.target.value)}
              placeholder="0"
              className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 text-sm text-slate-800 dark:text-slate-100 focus:border-blue-400 focus:outline-none focus:bg-white"
            />
          </Field>

          <Field label="סה״כ קלוריות" icon={<FaFire size={9} />} hint="מחושב אוטומטית">
            <div className="flex h-14 w-full items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/40 px-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <FaFire size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">קלוריות ליום</span>
              </div>
              <div className="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-300">
                {totalCalories.toLocaleString("he-IL")}
              </div>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500" dir="ltr">
              {protein}×150 + {carbs}×120 + {fats}×100 + {veggies}×30
              {freeCalories ? ` + ${freeCalories}` : ""}
            </div>
          </Field>

          {builderOptions.length > 0 && (
            <Field label="מאמן שבנה" icon={<FaUser size={9} />}>
              <div className="flex flex-wrap gap-1.5">
                {builderOptions.map((b) => {
                  const active = builtBy === b.value;
                  return (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() =>
                        setValue("builtByTrainerId", active ? undefined : b.value, {
                          shouldDirty: true,
                        })
                      }
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                        active
                          ? "border-transparent bg-blue-600 text-white shadow-sm"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-300"
                      }`}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}
        </div>

        <div className="flex flex-col gap-3 md:pr-5">
          <Field
            label="מנות מאקרו"
            icon={<FaDrumstickBite size={9} />}
            hint="מחושב אוטומטית מהארוחות"
          >
            <div className="grid grid-cols-4 gap-1.5">
              <MacroDisplay
                icon={<FaDrumstickBite size={9} />}
                label="חלבון"
                value={protein}
                tone="rose"
              />
              <MacroDisplay
                icon={<FaBreadSlice size={9} />}
                label="פחמ׳"
                value={carbs}
                tone="amber"
              />
              <MacroDisplay icon={<FaDroplet size={9} />} label="שומן" value={fats} tone="sky" />
              <MacroDisplay
                icon={<FaCarrot size={9} />}
                label="ירק"
                value={veggies}
                tone="emerald"
              />
            </div>
          </Field>

          <Field label="הגבלות" icon={<FaCircleExclamation size={9} />}>
            <div className="flex flex-wrap gap-1.5">
              {dietaryRestrictionOptions.map((o) => {
                const active = restrictions.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleRestriction(o.value)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                      active
                        ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-rose-300"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, icon, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </div>
      {hint && (
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">· {hint}</span>
      )}
    </div>
    {children}
  </div>
);

const MACRO_TONE = {
  rose: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
  amber: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
  sky: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300",
  emerald: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
};

const MacroDisplay: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: keyof typeof MACRO_TONE;
}> = ({ icon, label, value, tone }) => (
  <div className={`flex flex-col items-center gap-0.5 rounded-lg ${MACRO_TONE[tone]} p-1.5`}>
    <div className="flex items-center gap-1 text-[9px] font-bold">
      {icon}
      {label}
    </div>
    <div
      aria-readonly="true"
      className="flex h-6 w-full items-center justify-center rounded-md bg-white/60 dark:bg-slate-900/40 text-sm font-bold tabular-nums"
    >
      {value}
    </div>
  </div>
);

export default DietPlanMetaPanel;
