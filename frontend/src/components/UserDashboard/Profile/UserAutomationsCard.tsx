import { useState } from "react";
import {
  AppWindow,
  Bell,
  BellRing,
  ClipboardCheck,
  MessageSquare,
  Ruler,
  Scale,
} from "lucide-react";
import { FaCheck, FaPenToSquare } from "react-icons/fa6";
import { Switch } from "@/components/ui/switch";

type Frequency = "weekly" | "biweekly" | "monthly";

interface AutomationRules {
  morningWeighIn: { enabled: boolean; time: string; daysOfWeek: number[] };
  weeklyFeedback: { enabled: boolean; time: string; dayOfWeek: number };
  bodyMeasurements: {
    enabled: boolean;
    frequency: Frequency;
    time: string;
    dayOfWeek: number;
    dayOfMonth: number;
  };
  monthlyQuestionnaire: { enabled: boolean; time: string; dayOfMonth: number };
}

const DEFAULT_RULES: AutomationRules = {
  morningWeighIn: { enabled: true, time: "07:30", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
  weeklyFeedback: { enabled: true, time: "08:00", dayOfWeek: 0 },
  bodyMeasurements: {
    enabled: true,
    frequency: "biweekly",
    time: "08:00",
    dayOfWeek: 0,
    dayOfMonth: 1,
  },
  monthlyQuestionnaire: { enabled: true, time: "08:00", dayOfMonth: 1 },
};

const FREQ_LABEL: Record<Frequency, string> = {
  weekly: "פעם בשבוע",
  biweekly: "פעם בשבועיים",
  monthly: "פעם בחודש",
};

const DAY_LONG = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const DAY_SHORT = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

const BODY_TEXT = {
  morningWeighIn: "מתזכרים אותך לעדכן את השקילה היומית שלך",
  weeklyFeedback: "עדכן את הפידבק השבועי האחרון או שלח אישור",
  bodyMeasurements: "מתזכרים אותך לעדכן היקפים",
  monthlyQuestionnaire: "שאלון חודשי חדש מחכה לך",
};

type Channel = "push" | "inApp" | "both";

const CHANNEL_META: Record<Channel, { label: string; icon: React.ReactNode; className: string }> = {
  push: {
    label: "פוש במסך נעילה",
    icon: <BellRing size={11} />,
    className:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
  },
  inApp: {
    label: "בתוך האפליקציה",
    icon: <AppWindow size={11} />,
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  both: {
    label: "פוש + פופאפ באפליקציה",
    icon: <BellRing size={11} />,
    className:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20",
  },
};

type TintKey = "blue" | "purple" | "emerald" | "amber";

const TINT_CLASS: Record<TintKey, string> = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
};

function summarizeWeighIn(days: number[], time: string): string {
  if (days.length === 0) return "אין ימים פעילים";
  if (days.length === 7) return `כל יום בשעה ${time}`;
  const sorted = [...days].sort((a, b) => a - b);
  return `בימים ${sorted.map((d) => DAY_SHORT[d]).join(" · ")} בשעה ${time}`;
}
function summarizeWeekly(day: number, time: string): string {
  return `כל יום ${DAY_LONG[day]} בשעה ${time}`;
}
function summarizeBiweekly(day: number, time: string): string {
  return `אחת לשבועיים ביום ${DAY_LONG[day]} בשעה ${time}`;
}
function summarizeMonthly(day: number, time: string): string {
  return `כל ${day} לחודש בשעה ${time}`;
}

export function UserAutomationsCard() {
  const [rules, setRules] = useState<AutomationRules>(DEFAULT_RULES);
  const [isEditing, setIsEditing] = useState(false);

  const patch = <K extends keyof AutomationRules>(key: K, next: Partial<AutomationRules[K]>) =>
    setRules((prev) => ({ ...prev, [key]: { ...prev[key], ...next } }));

  const toggleWeighInDay = (day: number) => {
    const set = new Set(rules.morningWeighIn.daysOfWeek);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    patch("morningWeighIn", { daysOfWeek: Array.from(set) });
  };

  return (
    <section
      dir="rtl"
      className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl brand-gradient text-white shadow-sm">
            <Bell size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              אוטומציות למתאמן
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              מה נשלח למתאמן אוטומטית ומתי — כיבוי/הפעלה לכל אחד בנפרד
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing((v) => !v)}
          className={
            isEditing
              ? "inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              : "inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          }
        >
          {isEditing ? <FaCheck size={11} /> : <FaPenToSquare size={11} />}
          <span>{isEditing ? "סיום" : "עריכה"}</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <AutomationRow
          icon={<Scale size={16} />}
          tint="blue"
          title="תזכורת שקילה בוקר"
          description="פוש יומי למתאמן לרישום משקל השכם בבוקר"
          channel="push"
          bodyText={BODY_TEXT.morningWeighIn}
          summary={summarizeWeighIn(rules.morningWeighIn.daysOfWeek, rules.morningWeighIn.time)}
          enabled={rules.morningWeighIn.enabled}
          onToggle={(v) => patch("morningWeighIn", { enabled: v })}
          locked={!isEditing}
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <TimeSetting
              label="שעת שליחה"
              value={rules.morningWeighIn.time}
              onChange={(v) => patch("morningWeighIn", { time: v })}
              locked={!isEditing}
            />
            <DayOfWeekMultiPicker
              label="ימים פעילים"
              selected={rules.morningWeighIn.daysOfWeek}
              onToggle={toggleWeighInDay}
              locked={!isEditing}
            />
          </div>
        </AutomationRow>

        <AutomationRow
          icon={<MessageSquare size={16} />}
          tint="amber"
          title="פידבק שבועי"
          description="Popup סיכום סוף שבוע — נשלח גם כפוש למסך הנעילה"
          channel="both"
          bodyText={BODY_TEXT.weeklyFeedback}
          summary={summarizeWeekly(rules.weeklyFeedback.dayOfWeek, rules.weeklyFeedback.time)}
          enabled={rules.weeklyFeedback.enabled}
          onToggle={(v) => patch("weeklyFeedback", { enabled: v })}
          locked={!isEditing}
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <TimeSetting
              label="שעת שליחה"
              value={rules.weeklyFeedback.time}
              onChange={(v) => patch("weeklyFeedback", { time: v })}
              locked={!isEditing}
            />
            <DayOfWeekSinglePicker
              label="יום בשבוע"
              value={rules.weeklyFeedback.dayOfWeek}
              onChange={(v) => patch("weeklyFeedback", { dayOfWeek: v })}
              locked={!isEditing}
            />
          </div>
        </AutomationRow>

        <AutomationRow
          icon={<Ruler size={16} />}
          tint="purple"
          title="תזכורת היקפים"
          description="פוש תקופתי להעלאת מדידות היקפים ותמונות התקדמות"
          channel="push"
          bodyText={BODY_TEXT.bodyMeasurements}
          summary={
            rules.bodyMeasurements.frequency === "monthly"
              ? summarizeMonthly(rules.bodyMeasurements.dayOfMonth, rules.bodyMeasurements.time)
              : rules.bodyMeasurements.frequency === "biweekly"
              ? summarizeBiweekly(rules.bodyMeasurements.dayOfWeek, rules.bodyMeasurements.time)
              : summarizeWeekly(rules.bodyMeasurements.dayOfWeek, rules.bodyMeasurements.time)
          }
          enabled={rules.bodyMeasurements.enabled}
          onToggle={(v) => patch("bodyMeasurements", { enabled: v })}
          locked={!isEditing}
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <FrequencySetting
              label="תדירות"
              value={rules.bodyMeasurements.frequency}
              onChange={(v) => patch("bodyMeasurements", { frequency: v })}
              locked={!isEditing}
            />
            <TimeSetting
              label="שעת שליחה"
              value={rules.bodyMeasurements.time}
              onChange={(v) => patch("bodyMeasurements", { time: v })}
              locked={!isEditing}
            />
            {rules.bodyMeasurements.frequency === "monthly" ? (
              <DayOfMonthSetting
                label="יום בחודש"
                value={rules.bodyMeasurements.dayOfMonth || 1}
                onChange={(v) => patch("bodyMeasurements", { dayOfMonth: v })}
                locked={!isEditing}
              />
            ) : (
              <DayOfWeekSinglePicker
                label="יום בשבוע"
                value={rules.bodyMeasurements.dayOfWeek}
                onChange={(v) => patch("bodyMeasurements", { dayOfWeek: v })}
                locked={!isEditing}
              />
            )}
          </div>
        </AutomationRow>

        <AutomationRow
          icon={<ClipboardCheck size={16} />}
          tint="emerald"
          title="שאלון חודשי"
          description="פוש למתאמן ושאלון שנפתח באפליקציה בכל תחילת חודש"
          channel="both"
          bodyText={BODY_TEXT.monthlyQuestionnaire}
          summary={summarizeMonthly(
            rules.monthlyQuestionnaire.dayOfMonth,
            rules.monthlyQuestionnaire.time
          )}
          footnote="ההגדרה כאן דורסת את ברירת המחדל של השאלון"
          enabled={rules.monthlyQuestionnaire.enabled}
          onToggle={(v) => patch("monthlyQuestionnaire", { enabled: v })}
          locked={!isEditing}
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <TimeSetting
              label="שעת שליחה"
              value={rules.monthlyQuestionnaire.time}
              onChange={(v) => patch("monthlyQuestionnaire", { time: v })}
              locked={!isEditing}
            />
            <DayOfMonthSetting
              label="יום בחודש"
              value={rules.monthlyQuestionnaire.dayOfMonth || 1}
              onChange={(v) => patch("monthlyQuestionnaire", { dayOfMonth: v })}
              locked={!isEditing}
            />
          </div>
        </AutomationRow>
      </div>
    </section>
  );
}

function AutomationRow({
  icon,
  tint,
  title,
  description,
  channel,
  bodyText,
  summary,
  footnote,
  enabled,
  onToggle,
  locked,
  children,
}: {
  icon: React.ReactNode;
  tint: TintKey;
  title: string;
  description: string;
  channel: Channel;
  bodyText: string;
  summary: string;
  footnote?: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  locked: boolean;
  children?: React.ReactNode;
}) {
  const meta = CHANNEL_META[channel];
  return (
    <div
      className={`flex flex-col rounded-xl border p-3.5 transition-colors ${
        enabled
          ? "border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900"
          : "border-slate-200/60 bg-slate-50/40 dark:border-slate-800/60 dark:bg-slate-900/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${TINT_CLASS[tint]}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h4
              className={`text-sm font-bold ${
                enabled
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {title}
            </h4>
            <Switch
              dir="rtl"
              checked={enabled}
              onCheckedChange={onToggle}
              disabled={locked}
              className={locked ? "cursor-not-allowed opacity-70" : ""}
            />
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
          <span
            title={`טקסט הפוש: "${bodyText}"`}
            className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}
          >
            {meta.icon}
            <span>{meta.label}</span>
          </span>
        </div>
      </div>

      {enabled && (
        <div className="mt-3 border-t border-slate-100 pt-2.5 dark:border-slate-800">
          {children}
          <div className="mt-2.5 flex flex-col gap-0.5">
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              🕒 תזמון: {summary}
            </p>
            {footnote && (
              <p className="text-[10px] italic text-slate-400 dark:text-slate-500">{footnote}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TimeSetting({
  label,
  value,
  onChange,
  locked,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  locked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={locked}
        dir="ltr"
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      />
    </label>
  );
}

function FrequencySetting({
  label,
  value,
  onChange,
  locked,
}: {
  label: string;
  value: Frequency;
  onChange: (v: Frequency) => void;
  locked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Frequency)}
        disabled={locked}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      >
        <option value="weekly">{FREQ_LABEL.weekly}</option>
        <option value="biweekly">{FREQ_LABEL.biweekly}</option>
        <option value="monthly">{FREQ_LABEL.monthly}</option>
      </select>
    </label>
  );
}

function DayOfMonthSetting({
  label,
  value,
  onChange,
  locked,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  locked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <input
        type="number"
        min={1}
        max={28}
        value={value}
        onChange={(e) => onChange(Math.max(1, Math.min(28, Number(e.target.value) || 1)))}
        disabled={locked}
        className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
      />
    </label>
  );
}

function DayOfWeekSinglePicker({
  label,
  value,
  onChange,
  locked,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  locked: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <div className="flex gap-1">
        {DAY_SHORT.map((s, i) => {
          const active = value === i;
          return (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => onChange(i)}
              className={`flex h-7 w-7 items-center justify-center rounded-md border text-[11px] font-bold transition-colors ${
                active
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              } ${locked ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayOfWeekMultiPicker({
  label,
  selected,
  onToggle,
  locked,
}: {
  label: string;
  selected: number[];
  onToggle: (day: number) => void;
  locked: boolean;
}) {
  const set = new Set(selected);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}:</span>
      <div className="flex gap-1">
        {DAY_SHORT.map((s, i) => {
          const active = set.has(i);
          return (
            <button
              key={i}
              type="button"
              disabled={locked}
              onClick={() => onToggle(i)}
              className={`flex h-7 w-7 items-center justify-center rounded-md border text-[11px] font-bold transition-colors ${
                active
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              } ${locked ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
