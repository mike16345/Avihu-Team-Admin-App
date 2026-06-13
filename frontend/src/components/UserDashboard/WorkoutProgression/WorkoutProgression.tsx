/**
 * WorkoutProgression — מעקב כוח (עיצוב חדש מלא)
 *
 * שכבת תצוגה עליונה: 4 סטטיסטיקות + פילטר קבוצות שריר + כרטיסי תרגילים
 * שכבת תצוגה תחתונה (כשלוחצים על תרגיל): סלקטור + גרף + רשימת סטים מתועדים
 *
 * חיבור: useUserRecordedSets → GET /recordedSets/:userId
 */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";
import {
  FaDumbbell,
  FaNoteSticky,
  FaChevronDown,
  FaChevronUp,
  FaXmark,
  FaArrowTrendUp,
  FaBoltLightning,
  FaPencil,
} from "react-icons/fa6";
import { extractExercises } from "@/lib/workoutUtils";
import { generateExerciseProgressNote } from "@/lib/exerciseProgressNote";
import useUserRecordedSets from "@/hooks/queries/recordedSets/useUserRecordedSets";
import useMuscleGroupsQuery from "@/hooks/queries/MuscleGroups/useMuscleGroupsQuery";
import Loader from "@/components/ui/Loader";
import ErrorPage from "@/pages/ErrorPage";
import { workoutTab } from "@/pages/UserDashboard";
import useUserQuery from "@/hooks/queries/user/useUserQuery";

type RecordedSet = {
  weight?: number;
  repsDone?: number;
  date?: string | Date;
  setNumber?: number;
};

type FlatExercise = {
  name: string;
  group: string;
  sessions: { date: Date; weight: number; reps: number }[];
};

const groupColors: Record<string, { bg: string; text: string; gradient: string }> = {
  חזה: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    gradient: "from-blue-500 to-blue-600",
  },
  גב: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-500 to-emerald-600",
  },
  טרפזים: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    gradient: "from-amber-500 to-amber-600",
  },
  כתפיים: {
    bg: "bg-purple-50",
    text: "text-purple-700 dark:text-purple-300",
    gradient: "from-purple-500 to-purple-600",
  },
  "יד קידמית": {
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    text: "text-cyan-700 dark:text-cyan-300",
    gradient: "from-cyan-500 to-cyan-600",
  },
  "יד אחורית": {
    bg: "bg-teal-50 dark:bg-teal-950/40",
    text: "text-teal-700 dark:text-teal-300",
    gradient: "from-teal-500 to-teal-600",
  },
  רגליים: {
    bg: "bg-pink-50 dark:bg-pink-950/40",
    text: "text-pink-700 dark:text-pink-300",
    gradient: "from-pink-500 to-pink-600",
  },
  ישבן: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-300",
    gradient: "from-orange-500 to-orange-600",
  },
  תאומים: {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
    gradient: "from-indigo-500 to-indigo-600",
  },
  אמות: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500 to-rose-600",
  },
  בטן: {
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    text: "text-yellow-700 dark:text-yellow-300",
    gradient: "from-yellow-500 to-yellow-600",
  },
};

const defaultColor = {
  bg: "bg-slate-50 dark:bg-slate-800",
  text: "text-slate-700 dark:text-slate-200",
  gradient: "from-slate-500 to-slate-600",
};

const FALLBACK_GROUPS = [
  "חזה",
  "גב",
  "טרפזים",
  "כתפיים",
  "יד קדמית",
  "יד אחורית",
  "רגליים",
  "ישבן",
  "תאומים",
  "אמות",
  "בטן",
];

export const WorkoutProgression = () => {
  const { id } = useParams();
  const userFirstName = useUserQuery(id).data?.firstName;
  const { data: recordedWorkouts, isLoading, error } = useUserRecordedSets(id);
  const { data: muscleGroupsFromServer } = useMuscleGroupsQuery();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(
    searchParams.get("muscleGroup") || ""
  );
  const [selectedExercise, setSelectedExercise] = useState(searchParams.get("exercise") || "");
  const [filter, setFilter] = useState<string>("הכל");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [detailExercise, setDetailExercise] = useState<FlatExercise | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);

  const flatExercises: FlatExercise[] = useMemo(() => {
    if (!recordedWorkouts?.length) return [];
    const out: FlatExercise[] = [];
    recordedWorkouts.forEach((mg: any) => {
      const exercises = Object.keys(mg.recordedSets || {});
      exercises.forEach((exName) => {
        const sets: RecordedSet[] = mg.recordedSets[exName] || [];
        const sessionsByDate: Record<string, { weight: number; reps: number; date: Date }> = {};
        sets.forEach((s) => {
          const d = new Date(s.date || new Date());
          const dateKey = d.toISOString().split("T")[0];
          const w = s.weight ?? 0;
          const r = s.repsDone ?? 0;
          if (!sessionsByDate[dateKey] || w > sessionsByDate[dateKey].weight) {
            sessionsByDate[dateKey] = { weight: w, reps: r, date: d };
          }
        });
        const sessions = Object.values(sessionsByDate).sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        );
        if (sessions.length > 0) {
          out.push({ name: exName, group: mg.muscleGroup, sessions });
        }
      });
    });
    return out;
  }, [recordedWorkouts]);

  const availableGroups = useMemo(() => {
    const rawData: any = muscleGroupsFromServer;
    const serverArr: any[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.data)
        ? rawData.data
        : [];
    const fromServer: string[] = serverArr.map((mg) => mg?.name).filter(Boolean);
    const fromData = new Set<string>(flatExercises.map((e) => e.group));

    const merged: string[] = ["הכל"];
    FALLBACK_GROUPS.forEach((g) => {
      if (!merged.includes(g)) merged.push(g);
    });
    fromServer.forEach((g) => {
      if (!merged.includes(g)) merged.push(g);
    });
    fromData.forEach((g) => {
      if (!merged.includes(g)) merged.push(g);
    });
    return merged;
  }, [flatExercises, muscleGroupsFromServer]);

  const filteredExercises = useMemo(
    () => (filter === "הכל" ? flatExercises : flatExercises.filter((e) => e.group === filter)),
    [filter, flatExercises]
  );

  useEffect(() => {
    if (searchParams.get("tab") !== workoutTab || !recordedWorkouts) return;
    if (searchParams.get("muscleGroup") && searchParams.get("exercise")) return;

    const initialMuscleGroup = recordedWorkouts[0]?.muscleGroup || "";
    const initialExercise = extractExercises(recordedWorkouts[0]?.recordedSets)[0] || "";
    setSearchParams((s) => ({
      ...Object.fromEntries(s.entries()),
      muscleGroup: initialMuscleGroup,
      exercise: initialExercise,
    }));
    setSelectedMuscleGroup(initialMuscleGroup);
    setSelectedExercise(initialExercise);
  }, [recordedWorkouts, searchParams, setSearchParams]);

  const openExerciseDetails = (exercise: FlatExercise) => {
    setSelectedMuscleGroup(exercise.group);
    setSelectedExercise(exercise.name);
    setSearchParams((s) => ({
      ...Object.fromEntries(s.entries()),
      muscleGroup: exercise.group,
      exercise: exercise.name,
    }));
    setDetailExercise(exercise);
  };

  const detailRawSets: any[] = useMemo(() => {
    if (!detailExercise) return [];
    const mg = (recordedWorkouts as any[])?.find((x) => x.muscleGroup === detailExercise.group);
    return mg?.recordedSets?.[detailExercise.name] || [];
  }, [detailExercise, recordedWorkouts]);

  if (isLoading) return <Loader />;
  const errorStatus = (error as any)?.status;
  const isExpectedEmpty =
    errorStatus === 401 ||
    errorStatus === 403 ||
    errorStatus === 404 ||
    (error as any)?.data?.message === "Data could not be retrieved!";
  if (error && !isExpectedEmpty) return <ErrorPage message={(error as any).data?.message} />;

  return (
    <div dir="rtl" className="flex flex-col gap-4 font-heebo">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-3 py-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-1">
          {availableGroups.map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                filter === g
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <a
          href="#progress-note"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-slate-800"
        >
          <FaNoteSticky size={11} />
          <span>פתק התקדמות</span>
        </a>
      </div>

      {!flatExercises.length && (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-10 text-center">
          <FaDumbbell size={28} className="mx-auto mb-2 text-slate-300" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
            אין אימונים מתועדים עדיין
          </h3>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            כאשר {userFirstName || "המתאמן"} יתעד אימון ראשון, הנתונים יופיעו כאן.
          </p>
        </div>
      )}

      {flatExercises.length > 0 && (
        <>
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto pe-2 -me-2 [scrollbar-color:rgba(148,163,184,0.3)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-slate-400/30 [&::-webkit-scrollbar-thumb:hover]:bg-slate-400/50 [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredExercises.map((exercise) => {
                const first = exercise.sessions[0];
                const last = exercise.sessions[exercise.sessions.length - 1];
                const isBodyweight = exercise.sessions.every((s) => s.weight === 0);
                const gain = isBodyweight ? last.reps - first.reps : last.weight - first.weight;
                const gainPercent = isBodyweight
                  ? first.reps === 0
                    ? 0
                    : Math.round(((last.reps - first.reps) / first.reps) * 100)
                  : first.weight === 0
                    ? 0
                    : Math.round(((last.weight - first.weight) / first.weight) * 100);
                const colors = groupColors[exercise.group] || defaultColor;
                const isSelected =
                  selectedExercise === exercise.name && selectedMuscleGroup === exercise.group;

                const isExpanded = expandedCard === `${exercise.group}-${exercise.name}`;
                const sparklineValues = exercise.sessions.map((s) =>
                  isBodyweight ? s.reps : s.weight
                );

                return (
                  <div
                    key={`${exercise.group}-${exercise.name}`}
                    className={`overflow-hidden rounded-xl border bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md ${
                      isSelected
                        ? "border-blue-400 ring-2 ring-blue-200"
                        : "border-slate-200/80 dark:border-slate-800/80"
                    }`}
                  >
                    <button
                      onClick={() => openExerciseDetails(exercise)}
                      className="w-full p-4 text-right"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span
                            className={`inline-flex items-center rounded-full ${colors.bg} px-2 py-0.5 text-[10px] font-semibold ${colors.text}`}
                          >
                            {exercise.group}
                          </span>
                          <h3 className="mt-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                            {exercise.name}
                          </h3>
                        </div>
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${colors.gradient} text-white shadow-sm`}
                        >
                          <FaDumbbell size={12} />
                        </div>
                      </div>

                      <div className="mt-3 flex items-end justify-between gap-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            נוכחי
                          </p>
                          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {isBodyweight
                              ? `${last.reps} ${last.reps > 30 ? "שנ׳" : "חזרות"}`
                              : `${last.weight} ק״ג`}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isBodyweight ? "ללא משקל" : `${last.reps} חזרות`}
                          </p>
                        </div>
                        <div
                          className={`text-end ${
                            gain > 0
                              ? "text-emerald-600"
                              : gain < 0
                                ? "text-rose-600"
                                : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          <p className="text-xs font-semibold">
                            {gain > 0 ? "↑" : gain < 0 ? "↓" : "—"} {Math.abs(gain)}
                            {isBodyweight ? (last.reps > 30 ? " שנ׳" : "") : " ק״ג"}
                          </p>
                          <p className="text-[10px] font-bold">
                            {gainPercent > 0 ? "+" : ""}
                            {gainPercent}% מתחילת ליווי
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <MiniSparkline values={sparklineValues} gradient={colors.gradient} />
                      </div>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCard(isExpanded ? null : `${exercise.group}-${exercise.name}`);
                      }}
                      className="mx-4 mb-4 inline-flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {isExpanded ? <FaChevronUp size={9} /> : <FaChevronDown size={9} />}
                      <span>{isExpanded ? "הסתר היסטוריה" : "ראה היסטוריה מלאה"}</span>
                    </button>

                    {isExpanded &&
                      (() => {
                        // PR-broken sessions: each session where weight (or reps for bodyweight)
                        // EXCEEDS the previous best — i.e. the trainee broke a record.
                        const prSessionIndices = new Set<number>();
                        let runningBest = -Infinity;
                        exercise.sessions.forEach((s, idx) => {
                          const v = isBodyweight ? s.reps : s.weight;
                          if (v > runningBest) {
                            runningBest = v;
                            prSessionIndices.add(idx);
                          }
                        });
                        return (
                          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 px-4 py-3">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-slate-500 dark:text-slate-400">
                                  <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider">
                                    תאריך
                                  </th>
                                  <th className="pb-2 text-center text-[10px] font-semibold uppercase tracking-wider">
                                    {isBodyweight ? "זמן/חזרות" : "משקל"}
                                  </th>
                                  <th className="pb-2 text-center text-[10px] font-semibold uppercase tracking-wider">
                                    חזרות
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {exercise.sessions
                                  .map((s, idx) => ({ s, idx }))
                                  .reverse()
                                  .map(({ s, idx }) => {
                                    const isPR = prSessionIndices.has(idx);
                                    return (
                                      <tr
                                        key={idx}
                                        className={`border-t border-slate-100 dark:border-slate-800 ${
                                          isPR ? "bg-blue-50/60" : ""
                                        }`}
                                      >
                                        <td className="py-1.5 text-right text-slate-700 dark:text-slate-200">
                                          {s.date.toLocaleDateString("he-IL")}
                                          {isPR && (
                                            <span className="ms-1.5 inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:text-blue-300">
                                              🏆 שיא
                                            </span>
                                          )}
                                        </td>
                                        <td
                                          className={`py-1.5 text-center font-semibold ${
                                            isPR
                                              ? colors.text
                                              : "text-slate-700 dark:text-slate-200"
                                          }`}
                                        >
                                          {isBodyweight ? "—" : `${s.weight} ק״ג`}
                                        </td>
                                        <td
                                          className={`py-1.5 text-center font-semibold ${
                                            isPR
                                              ? colors.text
                                              : "text-slate-700 dark:text-slate-200"
                                          }`}
                                        >
                                          {s.reps}
                                          {isBodyweight && s.reps > 30 && " שנ׳"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {detailExercise && (
        <ExerciseDetailModal
          exercise={detailExercise}
          rawSets={detailRawSets}
          onClose={() => setDetailExercise(null)}
        />
      )}

      <button
        id="progress-note"
        onClick={() => setNoteOpen(true)}
        className="group relative flex h-[280px] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30 p-6 text-center shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 ring-2 ring-amber-200/60 transition-transform group-hover:scale-110">
          <FaNoteSticky size={22} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">צור פתק התקדמות</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            לחץ ליצירת פתק אוטומטי עם סיכום ההתקדמות של {userFirstName || "המתאמן"}
          </p>
        </div>
        <span className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-slate-800">
          פתח חלון יצירה ←
        </span>
      </button>

      {noteOpen && (
        <ProgressNoteCreator
          flatExercises={flatExercises}
          availableGroups={availableGroups}
          userName={userFirstName}
          recordedWorkouts={recordedWorkouts}
          onClose={() => setNoteOpen(false)}
        />
      )}
    </div>
  );
};

// ============== Exercise Detail Modal ==============

function ExerciseDetailModal({
  exercise,
  rawSets,
  onClose,
}: {
  exercise: FlatExercise;
  rawSets: any[];
  onClose: () => void;
}) {
  const colors = groupColors[exercise.group] || defaultColor;

  // Group raw sets by date to mimic sessions
  const sessions = useMemo(() => {
    const byDate = new Map<string, any[]>();
    rawSets.forEach((s) => {
      const d = new Date(s.date || new Date());
      const key = d.toLocaleDateString("he-IL");
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push({
        setNumber: s.setNumber || 1,
        weight: s.weight ?? 0,
        reps: s.repsDone ?? 0,
        program: s.plan,
      });
    });
    return Array.from(byDate.entries())
      .map(([date, sets]) => ({
        date,
        sets: sets.sort((a, b) => a.setNumber - b.setNumber),
      }))
      .sort((a, b) => {
        const [da, ma, ya] = a.date.split(".").length > 1 ? a.date.split(".") : a.date.split("/");
        const [db, mb, yb] = b.date.split(".").length > 1 ? b.date.split(".") : b.date.split("/");
        return new Date(`${ya}-${ma}-${da}`).getTime() - new Date(`${yb}-${mb}-${db}`).getTime();
      });
  }, [rawSets]);

  const [openDate, setOpenDate] = useState<string | null>(
    sessions[sessions.length - 1]?.date || null
  );

  const firstPR = sessions[0] ? Math.max(...sessions[0].sets.map((s) => s.weight)) : 0;
  const lastPR = sessions[sessions.length - 1]
    ? Math.max(...sessions[sessions.length - 1].sets.map((s) => s.weight))
    : 0;
  const totalGain = +(lastPR - firstPR).toFixed(1);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-7xl flex-col gap-4 overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 font-heebo shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span
              className={`inline-flex items-center rounded-full ${colors.bg} px-2.5 py-0.5 text-xs font-semibold ${colors.text}`}
            >
              קבוצת שריר: {exercise.group}
            </span>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {exercise.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">תרגיל — מעקב סטים מלא</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100"
            aria-label="סגור"
          >
            <FaXmark size={18} />
          </button>
        </div>

        <div className="grid h-[calc(90vh-140px)] min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          <div className="modal-sets-scroll flex h-full min-h-0 flex-col gap-3 overflow-y-scroll rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 p-3 pe-2 lg:order-2">
            {sessions.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                אין סטים מתועדים לתרגיל זה
              </p>
            )}
            {[...sessions].reverse().map((session) => {
              const isOpen = openDate === session.date;
              const [day, month, year] = session.date.split(/[./]/);
              const monthName =
                [
                  "ינואר",
                  "פברואר",
                  "מרץ",
                  "אפריל",
                  "מאי",
                  "יוני",
                  "יולי",
                  "אוגוסט",
                  "ספטמבר",
                  "אוקטובר",
                  "נובמבר",
                  "דצמבר",
                ][Number(month) - 1] || "";
              return (
                <div
                  key={session.date}
                  className={`shrink-0 overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all ${
                    isOpen
                      ? "border-blue-200 dark:border-blue-900/60 shadow-md"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <button
                    onClick={() => setOpenDate(isOpen ? null : session.date)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl text-center leading-none ${
                          isOpen
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span
                          className={`text-[9px] font-semibold uppercase tracking-wider ${
                            isOpen ? "text-white/80" : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {monthName}
                        </span>
                        <span
                          className={`text-xl font-bold ${
                            isOpen ? "text-white" : "text-slate-900 dark:text-slate-100"
                          }`}
                        >
                          {day}
                        </span>
                        <span
                          className={`text-[8px] font-medium ${
                            isOpen ? "text-white/70" : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {year}
                        </span>
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {session.sets.length} סטים
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          שיא: {Math.max(...session.sets.map((s) => s.weight))} ק״ג
                        </span>
                      </div>
                    </div>
                    <FaChevronDown
                      size={11}
                      className={`shrink-0 text-slate-400 dark:text-slate-500 transition-transform ${
                        isOpen ? "" : "-rotate-90"
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800 p-2.5">
                      {session.sets.map((s, idx) => {
                        const sessionMaxWeight = Math.max(...session.sets.map((x) => x.weight));
                        const isSessionPR = s.weight === sessionMaxWeight && s.weight > 0;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 rounded-lg border bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs ${
                              isSessionPR
                                ? "border-blue-300 bg-blue-50/40"
                                : "border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                                isSessionPR
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                              }`}
                            >
                              {s.setNumber}
                            </span>
                            <div className="flex flex-1 items-center justify-between gap-2">
                              <div className="flex items-baseline gap-3">
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                  {s.weight}{" "}
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    ק״ג
                                  </span>
                                </span>
                                <span className="text-slate-700 dark:text-slate-200">
                                  {s.reps}{" "}
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    חזרות
                                  </span>
                                </span>
                              </div>
                              {s.program && (
                                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                  {s.program}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="modal-sets-scroll flex h-full min-h-0 flex-col gap-3 overflow-y-scroll pe-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-0 pb-3 pt-5">
              <div className="mb-3 flex items-center justify-between px-5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    התקדמות שיא לאורך זמן
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    המשקל הכבד ביותר בכל אימון
                  </p>
                </div>
                {totalGain !== 0 && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      totalGain > 0
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {totalGain > 0 ? "↑ +" : "↓ "}
                    {Math.abs(totalGain)} ק״ג מתחילה
                  </span>
                )}
              </div>
              <PRTrendChart sessions={sessions} />
            </div>

            <ExerciseGoals sessions={sessions} />

            <MonthlyPRs sessions={sessions} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PRTrendChart({
  sessions,
}: {
  sessions: { date: string; sets: { weight: number; reps: number }[] }[];
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (sessions.length === 0) {
    return (
      <p className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">אין נתונים</p>
    );
  }

  // Detect bodyweight exercise — if all weights are 0, plot reps instead
  const isBodyweight = sessions.every((s) => s.sets.every((x) => !x.weight));
  const unit = isBodyweight ? "חזרות" : "ק״ג";

  // Reverse for RTL: newest LEFT, oldest RIGHT
  const points = [...sessions]
    .map((s) => ({
      date: s.date,
      value: isBodyweight
        ? Math.max(...s.sets.map((x) => x.reps || 0))
        : Math.max(...s.sets.map((x) => x.weight || 0)),
    }))
    .reverse();

  // If only ONE point — show it centered
  if (points.length === 1) {
    return (
      <div className="flex h-40 flex-col items-center justify-center">
        <p className="text-3xl font-bold text-blue-600">
          {points[0].value} {unit}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{points[0].date}</p>
      </div>
    );
  }

  const W = 600;
  const H = 180;
  const PAD_X = 5;
  const PAD_TOP = 14;
  const PAD_BOTTOM = 10;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  const min = Math.min(...points.map((p) => p.value));
  const max = Math.max(...points.map((p) => p.value));
  const isFlat = min === max;
  const padding = isFlat ? Math.max(min * 0.05, 0.5) : (max - min) * 0.12;
  const yMin = Math.max(0, min - padding);
  const yMax = max + padding;
  const range = yMax - yMin || 1;
  const stepX = innerW / Math.max(1, points.length - 1);
  const coords = points.map((p, i) => ({
    x: PAD_X + i * stepX,
    y: PAD_TOP + innerH - ((p.value - yMin) / range) * innerH,
    date: p.date,
    value: p.value,
  }));
  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${H - PAD_BOTTOM} L ${coords[0].x} ${H - PAD_BOTTOM} Z`;

  const hovered = hoverIdx !== null ? coords[hoverIdx] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-44 w-full"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="pr-trend-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#pr-trend-grad)" />
        <path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c, i) => (
          <g key={i}>
            {/* Larger invisible target for easier hover */}
            <circle
              cx={c.x}
              cy={c.y}
              r="14"
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ cursor: "pointer" }}
            />
            <circle
              cx={c.x}
              cy={c.y}
              r={hoverIdx === i ? 5 : 3.5}
              fill="#fff"
              stroke="#3b82f6"
              strokeWidth="2"
              pointerEvents="none"
            />
          </g>
        ))}
      </svg>

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs shadow-lg"
          style={{
            left: `${(hovered.x / W) * 100}%`,
            top: `${(hovered.y / H) * 100}%`,
            transform: "translate(-50%, calc(-100% - 10px))",
          }}
        >
          <p className="font-bold text-slate-900 dark:text-slate-100">
            {hovered.value} {unit}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{hovered.date}</p>
        </div>
      )}

      {/* Legend: first (newest, left) and last (oldest, right) values */}
      <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex flex-col items-start">
          <span className="font-bold text-blue-600">
            {coords[0].value} {unit}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{coords[0].date}</span>
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">
            חדש ביותר
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {coords[coords.length - 1].value} {unit}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {coords[coords.length - 1].date}
          </span>
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">ראשון</span>
        </div>
      </div>
    </div>
  );
}

function ExerciseGoals({
  sessions,
}: {
  sessions: { date: string; sets: { weight: number; reps: number; setNumber: number }[] }[];
}) {
  const allSets = sessions.flatMap((s) => s.sets);
  if (allSets.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-blue-50/30 p-4 text-center text-xs text-slate-400 dark:text-slate-500">
        אין סטים מתועדים — לא ניתן להציב יעד עדיין
      </div>
    );
  }
  return <ExerciseGoalsEditor allSets={allSets} />;
}

function ExerciseGoalsEditor({
  allSets,
}: {
  allSets: { weight: number; reps: number; setNumber: number }[];
}) {
  const heaviestSet = allSets.reduce((max, s) => (s.weight > max.weight ? s : max), allSets[0]);
  const currentPR = heaviestSet.weight;
  const currentReps = heaviestSet.reps;

  const [goalWeight, setGoalWeight] = useState<number>(Math.ceil(currentPR * 1.1) || 1);
  const [goalReps, setGoalReps] = useState<number>(currentReps);
  const [goalDate, setGoalDate] = useState<string>("");
  const [editing, setEditing] = useState(false);

  const gap = goalWeight - currentPR;
  const gapPct = currentPR > 0 ? ((gap / currentPR) * 100).toFixed(1) : "0";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50/40 via-white to-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <FaArrowTrendUp size={14} className="text-blue-600" />
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">יעד הבא</h4>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">(להציב מטרה למתאמן)</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
            שיא נוכחי
          </p>
          <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-slate-100">
            {currentPR} ק״ג
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{currentReps} חזרות</p>
        </div>
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-blue-600">יעד</p>
          <div className="mt-0.5 flex items-baseline gap-1">
            {editing ? (
              <input
                type="number"
                value={goalWeight}
                onChange={(e) => setGoalWeight(Number(e.target.value))}
                onBlur={() => setEditing(false)}
                autoFocus
                className="w-14 rounded-lg border border-blue-300 bg-white dark:bg-slate-900 px-1 py-0.5 text-lg font-bold text-blue-700 dark:text-blue-300 focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-lg font-bold text-blue-700 dark:text-blue-300"
              >
                {goalWeight} ק״ג
              </button>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400">×</span>
            <input
              type="number"
              value={goalReps}
              onChange={(e) => setGoalReps(Number(e.target.value))}
              className="w-10 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 px-1 py-0.5 text-sm font-bold text-blue-700 dark:text-blue-300 focus:border-blue-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400">חזרות</span>
            <button
              onClick={() => setEditing(true)}
              className="ms-auto text-blue-600"
              aria-label="ערוך"
            >
              <FaPencil size={8} />
            </button>
          </div>
          <input
            type="date"
            value={goalDate}
            onChange={(e) => setGoalDate(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 px-2 py-1 text-xs text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-emerald-600">פער</p>
          <p className="mt-0.5 text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {gap > 0 ? "+" : ""}
            {gap} ק״ג
          </p>
          <p className="text-[10px] text-emerald-600">
            {gapPct}% עלייה · {goalReps - currentReps > 0 ? "+" : ""}
            {goalReps - currentReps} חזרות
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <span>0 ק״ג</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            יעד: {goalWeight} ק״ג × {goalReps}
          </span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-blue-500 to-emerald-500"
            style={{
              width: `${Math.min(100, goalWeight > 0 ? (currentPR / goalWeight) * 100 : 0)}%`,
            }}
          />
        </div>
        <p className="mt-1 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          {goalWeight > 0 ? ((currentPR / goalWeight) * 100).toFixed(0) : 0}% מהיעד הושג
        </p>
      </div>
    </div>
  );
}

function MonthlyPRs({
  sessions,
}: {
  sessions: { date: string; sets: { weight: number; reps: number; setNumber: number }[] }[];
}) {
  if (sessions.length === 0) return null;

  const byMonth = new Map<
    string,
    { date: string; weight: number; reps: number; setNumber: number }
  >();
  sessions.forEach((session) => {
    const [, month, year] = session.date.split(/[./]/);
    const key = `${month}/${year}`;
    if (!session.sets.length) return;
    const topSet = session.sets.reduce(
      (max, s) => (s.weight > max.weight ? s : max),
      session.sets[0]
    );
    const existing = byMonth.get(key);
    if (!existing || topSet.weight > existing.weight) {
      byMonth.set(key, {
        date: session.date,
        weight: topSet.weight,
        reps: topSet.reps,
        setNumber: topSet.setNumber,
      });
    }
  });

  const months = Array.from(byMonth.entries())
    .map(([key, pr]) => {
      const [month, year] = key.split("/");
      return { key, month: Number(month), year, pr };
    })
    .sort((a, b) => {
      if (a.year !== b.year) return a.year.localeCompare(b.year);
      return a.month - b.month;
    });

  const monthNames = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="mb-3 flex items-center gap-2">
        <FaBoltLightning size={14} className="text-amber-500" />
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">שיאים חודשיים</h4>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          (המשקל הכבד ביותר בכל חודש)
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {months.map((m, i) => {
          const prev = i > 0 ? months[i - 1].pr.weight : null;
          const delta = prev !== null ? m.pr.weight - prev : null;
          return (
            <div
              key={m.key}
              className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-amber-50/60 via-white to-white p-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {monthNames[m.month - 1]} {m.year}
                  </p>
                  <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-slate-100">
                    {m.pr.weight}
                    <span className="text-xs text-slate-500 dark:text-slate-400"> ק״ג</span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                    {m.pr.reps} חזרות
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                  <FaBoltLightning size={11} />
                </div>
              </div>
              {delta !== null && (
                <div
                  className={`mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                    delta > 0
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                      : delta < 0
                        ? "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <span>{delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}</span>
                  <span>
                    {delta > 0 ? "+" : ""}
                    {delta.toFixed(1)} ק״ג
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============== Progress Note Creator Modal ==============

function ProgressNoteCreator({
  flatExercises,
  availableGroups,
  userName,
  recordedWorkouts,
  onClose,
}: {
  flatExercises: FlatExercise[];
  availableGroups: string[];
  userName?: string;
  recordedWorkouts?: any[];
  onClose: () => void;
}) {
  // Date range — last 30 days by default
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(fmt(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(fmt(today));
  const [muscleGroup, setMuscleGroup] = useState<string>(
    availableGroups.filter((g) => g !== "הכל")[0] || ""
  );
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [manualText, setManualText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const availableExercises = flatExercises.filter((e) => e.group === muscleGroup);

  const toggleExercise = (name: string) => {
    setSelectedExercises((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
    setManualText(null);
  };

  /**
   * Generate the message using the ORIGINAL `generateExerciseProgressNote`
   * helper from `@/lib/exerciseProgressNote`. This restores the structured
   * Hebrew format the team is used to:
   *
   *   מה איתך {שם},
   *   עברתי על ההתקדמות שלך באימונים.
   *
   *   מ-*{from} עד {to}*:
   *
   *   *{קבוצת שריר}*:
   *
   *   *{תרגיל}*
   *   התחלה בתוכנית: משקל X (חזרות: Y)
   *   {תאריך הראשון בטווח}: משקל X (חזרות: Y)
   *   {תאריך האחרון בטווח}: משקל X (חזרות: Y)
   *
   *   מטרה:
   *   ...
   *   מטרה כללית:
   *
   * The original generator expects `selectedByMuscleGroup` (Record<group,
   * exercises[]>). In this redesigned modal we only support picking from
   * one group at a time, so we feed it a single-entry record.
   */
  const generatedNote = useMemo(() => {
    if (selectedExercises.length === 0) return "";
    return generateExerciseProgressNote({
      userName,
      selectedByMuscleGroup: { [muscleGroup]: selectedExercises },
      muscleGroupOrder: [muscleGroup],
      dateRange: {
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
      },
      recordedWorkouts,
    });
  }, [selectedExercises, muscleGroup, startDate, endDate, recordedWorkouts, userName]);
  // Suppress unused-var warning — `flatExercises` is still consumed
  // elsewhere (availableExercises filter); kept here for clarity.
  void flatExercises;

  const noteText = manualText !== null ? manualText : generatedNote;

  const regenerate = () => setManualText(null);

  const copyToClipboard = () => {
    if (noteText && navigator.clipboard) {
      navigator.clipboard.writeText(noteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 font-heebo backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-6xl flex-col gap-4 overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 ring-1 ring-amber-200">
              <FaNoteSticky size={16} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                צור פתק התקדמות
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                בחר טווח תאריכים ותרגילים ליצירת פתק אוטומטי
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100"
          >
            <FaXmark size={18} />
          </button>
        </div>

        {/* Body — 2 columns */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
          {/* Right: Form */}
          <div className="modal-sets-scroll flex min-h-0 flex-col gap-4 overflow-y-auto pl-1">
            {/* Date range */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                טווח תאריכים
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-[10px] text-slate-400 dark:text-slate-500">מ-</p>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setManualText(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <p className="mb-1 text-[10px] text-slate-400 dark:text-slate-500">עד</p>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setManualText(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Muscle group */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                קבוצת שרירים
              </label>
              <div className="relative">
                <select
                  value={muscleGroup}
                  onChange={(e) => {
                    setMuscleGroup(e.target.value);
                    setSelectedExercises([]);
                    setManualText(null);
                  }}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 pe-9 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  {availableGroups
                    .filter((g) => g !== "הכל")
                    .map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                </select>
                <FaChevronDown
                  size={10}
                  className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
              </div>
            </div>

            {/* Exercise selector */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                תרגילים ({availableExercises.length})
              </label>
              <div className="flex flex-col gap-2">
                {availableExercises.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    אין תרגילים בקבוצה זו
                  </p>
                ) : (
                  availableExercises.map((ex) => {
                    const selected = selectedExercises.includes(ex.name);
                    return (
                      <button
                        key={ex.name}
                        onClick={() => toggleExercise(ex.name)}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-right text-sm transition-all ${
                          selected
                            ? "border-amber-300 bg-amber-50/60 text-amber-800"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="font-medium">{ex.name}</span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            selected
                              ? "border-amber-500 bg-amber-500 text-white"
                              : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          }`}
                        >
                          {selected && "✓"}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Left: Generated note preview */}
          <div className="flex min-h-0 flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  הפתק המוצע
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ניתן לערוך את הטקסט ידנית לפני שליחה
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!noteText}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40"
                >
                  {copied ? "✓ הועתק!" : "העתק"}
                </button>
                <button
                  onClick={regenerate}
                  disabled={selectedExercises.length === 0}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40"
                >
                  רענן פתק
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0">
              {selectedExercises.length === 0 ? (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 text-center">
                  <FaNoteSticky size={28} className="text-slate-300" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    בחר תרגילים כדי ליצור פתק התקדמות.
                  </p>
                </div>
              ) : (
                <textarea
                  value={noteText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="h-full min-h-[300px] w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 p-4 text-sm leading-relaxed text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
                  dir="rtl"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniSparkline({ values, gradient }: { values: number[]; gradient: string }) {
  if (values.length === 0) return null;
  const W = 200;
  const H = 40;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = W / Math.max(1, values.length - 1);

  const points = values.map((v, i) => ({
    x: i * stepX,
    y: H - ((v - min) / range) * (H - 6) - 3,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;

  const colorMap: Record<string, string> = {
    "from-blue-500 to-blue-600": "#3b82f6",
    "from-emerald-500 to-emerald-600": "#10b981",
    "from-amber-500 to-amber-600": "#f59e0b",
    "from-purple-500 to-purple-600": "#a855f7",
    "from-cyan-500 to-cyan-600": "#06b6d4",
    "from-teal-500 to-teal-600": "#14b8a6",
    "from-pink-500 to-pink-600": "#ec4899",
    "from-orange-500 to-orange-600": "#f97316",
    "from-indigo-500 to-indigo-600": "#6366f1",
    "from-rose-500 to-rose-600": "#f43f5e",
    "from-yellow-500 to-yellow-600": "#eab308",
    "from-slate-500 to-slate-600": "#64748b",
  };
  const stroke = colorMap[gradient] || "#3b82f6";
  const id = `spark-${gradient.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-10 w-full">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${id})`} />
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="1.5"
          fill="#fff"
          stroke={stroke}
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
