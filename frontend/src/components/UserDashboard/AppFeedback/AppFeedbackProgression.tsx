import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarWeek,
  FaCommentDots,
  FaDumbbell,
  FaAppleWhole,
  FaShoePrints,
  FaMoon,
  FaWeightScale,
  FaCheck,
} from "react-icons/fa6";

interface DayMark {
  label: string;
  done: boolean;
  note?: string;
}

interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  submittedAt: string;
  workouts: { total: number; doneIndexes: number[] };
  nutritionDays: DayMark[];
  weight: { current: number; delta: number; measurements: number };
  steps: { weekTotal: number; weeklyGoal: number };
  sleep: { avgHours: number; targetHours: string };
  feedback: string;
}

const DEMO_REPORTS: WeeklyReport[] = [
  {
    weekStart: "2026-08-09",
    weekEnd: "2026-08-15",
    submittedAt: "2026-08-13T14:22:00",
    workouts: { total: 4, doneIndexes: [1, 2, 3] },
    nutritionDays: [
      { label: "א׳", done: true },
      { label: "ב׳", done: true, note: "אירוע משפחתי — חריגה קלה" },
      { label: "ג׳", done: true },
      { label: "ד׳", done: true },
      { label: "ה׳", done: false },
      { label: "ו׳", done: false },
      { label: "ש׳", done: false },
    ],
    weight: { current: 104.3, delta: -1.3, measurements: 5 },
    steps: { weekTotal: 42500, weeklyGoal: 70000 },
    sleep: { avgHours: 7.5, targetHours: "7-8" },
    feedback: "השבוע היה טוב, הצלחתי לעמוד באימונים. בקשה: אפשר להעלות סקוואט?",
  },
  {
    weekStart: "2026-08-02",
    weekEnd: "2026-08-08",
    submittedAt: "2026-08-08T21:04:00",
    workouts: { total: 4, doneIndexes: [1, 2, 3, 4] },
    nutritionDays: [
      { label: "א׳", done: true },
      { label: "ב׳", done: true },
      { label: "ג׳", done: true },
      { label: "ד׳", done: true },
      { label: "ה׳", done: true },
      { label: "ו׳", done: true },
      { label: "ש׳", done: true },
    ],
    weight: { current: 105.6, delta: -0.8, measurements: 4 },
    steps: { weekTotal: 68000, weeklyGoal: 70000 },
    sleep: { avgHours: 7.8, targetHours: "7-8" },
    feedback: "שבוע מצוין. אפשר עוד גיוון בארוחה 3 (דגים)?",
  },
  {
    weekStart: "2026-07-26",
    weekEnd: "2026-08-01",
    submittedAt: "2026-08-01T19:15:00",
    workouts: { total: 4, doneIndexes: [1, 2] },
    nutritionDays: [
      { label: "א׳", done: true },
      { label: "ב׳", done: false, note: "יום עמוס בעבודה" },
      { label: "ג׳", done: true },
      { label: "ד׳", done: false },
      { label: "ה׳", done: true },
      { label: "ו׳", done: true },
      { label: "ש׳", done: false },
    ],
    weight: { current: 106.4, delta: 0.2, measurements: 3 },
    steps: { weekTotal: 31200, weeklyGoal: 70000 },
    sleep: { avgHours: 6.5, targetHours: "7-8" },
    feedback: "שבוע פחות טוב, לחץ בעבודה. נסבל, אנסה לחזור למסלול.",
  },
  {
    weekStart: "2026-07-19",
    weekEnd: "2026-07-25",
    submittedAt: "2026-07-25T20:00:00",
    workouts: { total: 4, doneIndexes: [1, 2, 3, 4] },
    nutritionDays: [
      { label: "א׳", done: true },
      { label: "ב׳", done: true },
      { label: "ג׳", done: true },
      { label: "ד׳", done: true },
      { label: "ה׳", done: true },
      { label: "ו׳", done: false },
      { label: "ש׳", done: true },
    ],
    weight: { current: 106.2, delta: -0.4, measurements: 4 },
    steps: { weekTotal: 55000, weeklyGoal: 70000 },
    sleep: { avgHours: 7.2, targetHours: "7-8" },
    feedback: "מרגיש חזק. סוף שבוע קצת חופשי בתפריט.",
  },
  {
    weekStart: "2026-07-12",
    weekEnd: "2026-07-18",
    submittedAt: "2026-07-18T18:30:00",
    workouts: { total: 4, doneIndexes: [1, 3] },
    nutritionDays: [
      { label: "א׳", done: true, note: "יום כיפור התחלתי צום" },
      { label: "ב׳", done: false },
      { label: "ג׳", done: true },
      { label: "ד׳", done: true },
      { label: "ה׳", done: false, note: "מחלה קלה" },
      { label: "ו׳", done: false },
      { label: "ש׳", done: true },
    ],
    weight: { current: 106.6, delta: -0.1, measurements: 3 },
    steps: { weekTotal: 28500, weeklyGoal: 70000 },
    sleep: { avgHours: 6.8, targetHours: "7-8" },
    feedback:
      "היה לי מצב פחות טוב השבוע — הצטננתי באמצע השבוע ולא הצלחתי לצאת לאימונים. אשתדל להשלים את זה בשבוע הבא.",
  },
];

const formatShortDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const formatSteps = (v: number): string => v.toLocaleString("he-IL");

const formatHours = (h: number): string => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh}:${String(mm).padStart(2, "0")}`;
};

const MiniStat: React.FC<{
  icon: React.ReactNode;
  primary: string;
  sub: string;
}> = ({ icon, primary, sub }) => (
  <div className="flex-1 rounded-lg bg-slate-50 dark:bg-slate-800 p-3 min-w-0">
    <div className="flex items-center gap-1 mb-1.5 text-blue-600 dark:text-blue-400">{icon}</div>
    <div className="text-base font-bold text-slate-900 dark:text-slate-50 truncate">{primary}</div>
    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{sub}</div>
  </div>
);

const ReportCard: React.FC<{ report: WeeklyReport }> = ({ report }) => {
  const doneNutritionDays = report.nutritionDays.filter((d) => d.done).length;
  const nutritionPercent = Math.round((doneNutritionDays / report.nutritionDays.length) * 100);

  return (
    <div className="h-full min-h-[560px] rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {formatShortDate(report.submittedAt)}
        </span>
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-100">
          <FaCalendarWeek size={14} className="text-blue-500" />
          <span>
            {formatShortDate(report.weekStart)}–{formatShortDate(report.weekEnd)}
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            אימונים {report.workouts.doneIndexes.length}/{report.workouts.total}
          </span>
          <FaDumbbell size={12} className="text-blue-600" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: report.workouts.total }).map((_, i) => {
            const num = i + 1;
            const done = report.workouts.doneIndexes.includes(num);
            return (
              <div
                key={num}
                className={`flex-1 flex flex-col items-center rounded-lg border py-2 gap-0.5 ${
                  done
                    ? "bg-emerald-50 border-emerald-400 dark:bg-emerald-950"
                    : "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    done ? "bg-emerald-500" : "border border-dashed border-slate-400"
                  }`}
                >
                  {done && <FaCheck size={8} className="text-white" />}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">אימון</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  {num}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            תזונה {nutritionPercent}% ({doneNutritionDays}/7)
          </span>
          <FaAppleWhole size={12} className="text-blue-600" />
        </div>
        <div className="flex flex-col gap-1">
          {report.nutritionDays.map((day, i) => (
            <div
              key={i}
              className={`relative flex items-center justify-between gap-2 rounded-lg px-3 py-2 ${
                day.done ? "bg-emerald-50 dark:bg-emerald-950" : "bg-slate-50 dark:bg-slate-800"
              }`}
            >
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                {day.label}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {day.note && (
                  <div className="relative group" title={day.note}>
                    <button
                      type="button"
                      className="w-5 h-5 rounded-full flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-600 cursor-help transition-colors"
                      aria-label="הצג הערה"
                    >
                      <FaCommentDots size={10} />
                    </button>
                    <div
                      role="tooltip"
                      className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 z-30 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl"
                    >
                      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                        <FaCommentDots className="text-emerald-600" size={14} />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          הערת יום {day.label}
                        </span>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700" />
                      <div className="px-4 py-3 text-sm text-right text-slate-700 dark:text-slate-200 leading-6 whitespace-normal break-words">
                        {day.note}
                      </div>
                    </div>
                  </div>
                )}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    day.done ? "bg-emerald-500" : "border border-dashed border-slate-400"
                  }`}
                >
                  {day.done && <FaCheck size={10} className="text-white" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1.5">
        <MiniStat
          icon={<FaWeightScale size={10} />}
          primary={`${report.weight.current.toFixed(1)}kg`}
          sub={`${report.weight.delta > 0 ? "+" : ""}${report.weight.delta.toFixed(1)}`}
        />
        <MiniStat
          icon={<FaShoePrints size={10} />}
          primary={`${formatSteps(report.steps.weekTotal)} דק׳`}
          sub={
            report.steps.weeklyGoal > 0
              ? `יעד: ${formatSteps(report.steps.weeklyGoal)} דק׳`
              : "אין יעד"
          }
        />
        <MiniStat
          icon={<FaMoon size={10} />}
          primary={formatHours(report.sleep.avgHours)}
          sub={report.sleep.targetHours}
        />
      </div>

      <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            פידבק
          </span>
          <FaCommentDots size={12} className="text-blue-600" />
        </div>
        <p className="text-xs leading-6 text-slate-700 dark:text-slate-200 text-right whitespace-pre-line">
          {report.feedback}
        </p>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 shadow-sm">
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="rounded-full bg-blue-50 dark:bg-slate-800 p-4">
        <FaCommentDots size={28} className="text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        עדיין לא התקבל פידבק שבועי
      </h3>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400 leading-6">
        כאשר המתאמן ישלח את הפידבק השבועי מהאפליקציה, הוא יופיע כאן עם כל נתוני השבוע.
      </p>
    </div>
  </div>
);

const WEEKLY_FEEDBACK_MOCK_URL = "http://localhost:5555";

const DAY_LABELS_HE = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

const dayKeyFromWeekStart = (weekStart: string, offset: number): string => {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const mapApiDocToReport = (doc: any): WeeklyReport => {
  const dayNotes = doc.nutrition?.dayNotes || {};
  const daysCompleted = new Set<string>(doc.nutrition?.daysCompleted || []);
  const nutritionDays: DayMark[] = DAY_LABELS_HE.map((label, i) => {
    const key = dayKeyFromWeekStart(doc.weekStart, i);
    return {
      label,
      done: daysCompleted.has(key),
      note: dayNotes[key] || undefined,
    };
  });
  const doneIndexes = (doc.workouts || [])
    .map((w: any, idx: number) => ((w.doneManual || w.doneSmart) ? idx + 1 : null))
    .filter((v: number | null) => v !== null) as number[];
  return {
    weekStart: doc.weekStart?.slice(0, 10) || "",
    weekEnd: doc.weekEnd?.slice(0, 10) || "",
    submittedAt: doc.updatedAt || doc.submittedAt,
    workouts: { total: doc.workouts?.length || 0, doneIndexes },
    nutritionDays,
    weight: { current: 0, delta: 0, measurements: doc.weighIns?.length || 0 },
    steps: {
      weekTotal: doc.cardioMinutes ?? doc.steps ?? 0,
      weeklyGoal: doc.cardioMinutesGoal ?? 0,
    },
    sleep: { avgHours: doc.sleepHours ?? 0, targetHours: "7-8" },
    feedback: doc.feedbackText || "",
  };
};

interface AppFeedbackProgressionProps {
  userId?: string;
}

export default function AppFeedbackProgression({ userId }: AppFeedbackProgressionProps) {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    axios
      .get(`${WEEKLY_FEEDBACK_MOCK_URL}/weeklyFeedback/user/${userId}`)
      .then((res) => {
        if (cancelled) return;
        const docs = res.data?.data || [];
        setReports(docs.map(mapApiDocToReport));
      })
      .catch(() => {
        if (!cancelled) setReports([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-500">טוען פידבקים…</div>
    );
  }

  if (reports.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaCommentDots size={16} className="text-blue-600" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            פידבק שבועי מהאפליקציה
          </h3>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          מוצגים {reports.length} דוחות שבועיים
        </span>
      </div>
      <div className="overflow-x-auto -mx-1 px-1 pb-3 snap-x snap-mandatory">
        <div className="flex gap-4">
          {reports.map((r) => (
            <div
              key={r.weekStart}
              className="snap-start shrink-0 basis-[calc((100%-48px)/4)]"
            >
              <ReportCard report={r} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
