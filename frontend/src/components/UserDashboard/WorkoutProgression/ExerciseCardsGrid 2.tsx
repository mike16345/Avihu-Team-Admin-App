import { FaChevronDown, FaChevronUp, FaDumbbell } from "react-icons/fa6";

import { defaultColor, groupColors, type FlatExercise } from "./workoutProgressionModel";
import { MiniSparkline } from "./MiniSparkline";

type ExerciseSession = FlatExercise["sessions"][number];

type ExerciseCardsGridProps = {
  exercises: FlatExercise[];
  selectedExercise: string;
  selectedMuscleGroup: string;
  expandedCard: string | null;
  onExpandedCardChange: (cardId: string | null) => void;
  onOpenExerciseDetails: (exercise: FlatExercise) => void;
};

const getExerciseCardId = (exercise: FlatExercise) => `${exercise.group}-${exercise.name}`;

const isBodyweightExercise = (sessions: ExerciseSession[]) =>
  sessions.every((session) => session.weight === 0);

const getSessionValue = (session: ExerciseSession, isBodyweight: boolean) => {
  if (isBodyweight) return session.reps;
  return session.weight;
};

const calculateGainPercent = (
  first: ExerciseSession,
  last: ExerciseSession,
  isBodyweight: boolean
) => {
  const startValue = getSessionValue(first, isBodyweight);
  const endValue = getSessionValue(last, isBodyweight);

  if (startValue === 0) return 0;
  return Math.round(((endValue - startValue) / startValue) * 100);
};

const getGainToneClassName = (gain: number) => {
  if (gain > 0) return "text-emerald-600";
  if (gain < 0) return "text-rose-600";
  return "text-slate-400 dark:text-slate-500";
};

const getGainDirectionIcon = (gain: number) => {
  if (gain > 0) return "↑";
  if (gain < 0) return "↓";
  return "—";
};

const getCurrentValueText = (last: ExerciseSession, isBodyweight: boolean) => {
  if (!isBodyweight) return `${last.weight} ק״ג`;

  if (last.reps > 30) return `${last.reps} שנ׳`;
  return `${last.reps} חזרות`;
};

const getCurrentSubtext = (last: ExerciseSession, isBodyweight: boolean) => {
  if (isBodyweight) return "ללא משקל";
  return `${last.reps} חזרות`;
};

const getGainUnitSuffix = (last: ExerciseSession, isBodyweight: boolean) => {
  if (!isBodyweight) return " ק״ג";
  if (last.reps > 30) return " שנ׳";
  return "";
};

const getExerciseCardBorderClassName = (isSelected: boolean) => {
  if (isSelected) return "border-blue-400 ring-2 ring-blue-200";
  return "border-slate-200/80 dark:border-slate-800/80";
};

const getHistoryTextClassName = (isPR: boolean, colorTextClassName: string) => {
  if (isPR) return colorTextClassName;
  return "text-slate-700 dark:text-slate-200";
};

const getHistoryRowClassName = (isPR: boolean) => {
  if (isPR) return "bg-blue-50/60";
  return "";
};

const getHistoryMetricLabel = (isBodyweight: boolean) => {
  if (isBodyweight) return "זמן/חזרות";
  return "משקל";
};

const getHistoryWeightText = (session: ExerciseSession, isBodyweight: boolean) => {
  if (isBodyweight) return "—";
  return `${session.weight} ק״ג`;
};

const getBodyweightDurationSuffix = (session: ExerciseSession, isBodyweight: boolean) => {
  if (!isBodyweight || session.reps <= 30) return "";
  return " שנ׳";
};

const getPRSessionIndices = (sessions: ExerciseSession[], isBodyweight: boolean) => {
  const prSessionIndices = new Set<number>();
  let runningBest = -Infinity;

  sessions.forEach((session, index) => {
    const value = getSessionValue(session, isBodyweight);
    if (value > runningBest) {
      runningBest = value;
      prSessionIndices.add(index);
    }
  });

  return prSessionIndices;
};

const getExpandButtonState = (isExpanded: boolean) => {
  if (isExpanded) {
    return {
      Icon: FaChevronUp,
      label: "הסתר היסטוריה",
    };
  }

  return {
    Icon: FaChevronDown,
    label: "ראה היסטוריה מלאה",
  };
};

const getNextExpandedCardId = (isExpanded: boolean, cardId: string) => {
  if (isExpanded) return null;
  return cardId;
};

export function ExerciseCardsGrid({
  exercises,
  selectedExercise,
  selectedMuscleGroup,
  expandedCard,
  onExpandedCardChange,
  onOpenExerciseDetails,
}: ExerciseCardsGridProps) {
  return (
    <div className="max-h-[calc(100vh-280px)] overflow-y-auto pe-2 -me-2 [scrollbar-color:rgba(148,163,184,0.3)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-slate-400/30 [&::-webkit-scrollbar-thumb:hover]:bg-slate-400/50 [&::-webkit-scrollbar-track]:bg-transparent">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {exercises.map((exercise) => {
          const first = exercise.sessions[0];
          const last = exercise.sessions[exercise.sessions.length - 1];
          const isBodyweight = isBodyweightExercise(exercise.sessions);
          const gain = getSessionValue(last, isBodyweight) - getSessionValue(first, isBodyweight);
          const gainPercent = calculateGainPercent(first, last, isBodyweight);
          const colors = groupColors[exercise.group] || defaultColor;
          const isSelected =
            selectedExercise === exercise.name && selectedMuscleGroup === exercise.group;
          const cardId = getExerciseCardId(exercise);
          const isExpanded = expandedCard === cardId;
          const expandButtonState = getExpandButtonState(isExpanded);
          const ExpandIcon = expandButtonState.Icon;
          const prSessionIndices = getPRSessionIndices(exercise.sessions, isBodyweight);
          const sparklineValues = exercise.sessions.map((session) =>
            getSessionValue(session, isBodyweight)
          );

          return (
            <div
              key={cardId}
              className={`overflow-hidden rounded-xl border bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md ${getExerciseCardBorderClassName(
                isSelected
              )}`}
            >
              <button
                onClick={() => onOpenExerciseDetails(exercise)}
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
                      {getCurrentValueText(last, isBodyweight)}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {getCurrentSubtext(last, isBodyweight)}
                    </p>
                  </div>
                  <div className={`text-end ${getGainToneClassName(gain)}`}>
                    <p className="text-xs font-semibold">
                      {getGainDirectionIcon(gain)} {Math.abs(gain)}
                      {getGainUnitSuffix(last, isBodyweight)}
                    </p>
                    <p className="text-[10px] font-bold">
                      {gainPercent > 0 && "+"}
                      {gainPercent}% מתחילת ליווי
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <MiniSparkline values={sparklineValues} gradient={colors.gradient} />
                </div>
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onExpandedCardChange(getNextExpandedCardId(isExpanded, cardId));
                }}
                className="mx-4 mb-4 inline-flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <ExpandIcon size={9} />
                <span>{expandButtonState.label}</span>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 px-4 py-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 dark:text-slate-400">
                        <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider">
                          תאריך
                        </th>
                        <th className="pb-2 text-center text-[10px] font-semibold uppercase tracking-wider">
                          {getHistoryMetricLabel(isBodyweight)}
                        </th>
                        <th className="pb-2 text-center text-[10px] font-semibold uppercase tracking-wider">
                          חזרות
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercise.sessions
                        .map((session, index) => ({ session, index }))
                        .reverse()
                        .map(({ session, index }) => {
                          const isPR = prSessionIndices.has(index);
                          const historyValueClassName = getHistoryTextClassName(isPR, colors.text);

                          return (
                            <tr
                              key={index}
                              className={`border-t border-slate-100 dark:border-slate-800 ${getHistoryRowClassName(
                                isPR
                              )}`}
                            >
                              <td className="py-1.5 text-right text-slate-700 dark:text-slate-200">
                                {session.date.toLocaleDateString("he-IL")}
                                {isPR && (
                                  <span className="ms-1.5 inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:text-blue-300">
                                    🏆 שיא
                                  </span>
                                )}
                              </td>
                              <td
                                className={`py-1.5 text-center font-semibold ${historyValueClassName}`}
                              >
                                {getHistoryWeightText(session, isBodyweight)}
                              </td>
                              <td
                                className={`py-1.5 text-center font-semibold ${historyValueClassName}`}
                              >
                                {session.reps}
                                {getBodyweightDurationSuffix(session, isBodyweight)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
