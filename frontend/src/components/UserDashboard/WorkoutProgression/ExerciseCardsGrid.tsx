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

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const getExerciseCardId = (exercise: FlatExercise) => `${exercise.group}-${exercise.name}`;

const isBodyweightExercise = (sessions: ExerciseSession[]) =>
  sessions.every((session) => session.weight === 0);

const getSessionValue = (session: ExerciseSession, isBodyweight: boolean) =>
  isBodyweight ? session.reps : session.weight;

const getSessionUnitLabel = (session: ExerciseSession, isBodyweight: boolean) => {
  if (!isBodyweight) return "ק״ג";
  if (session.reps > 30) return "שנ׳";
  return "חזרות";
};

const findMonthAnchor = (sessions: ExerciseSession[]) => {
  const cutoff = new Date(sessions[sessions.length - 1].date.getTime() - MONTH_MS);
  const insideWindow = sessions.find((session) => session.date.getTime() >= cutoff.getTime());
  if (insideWindow) return insideWindow;
  return sessions[Math.max(0, sessions.length - 2)];
};

const getLastMonthSessions = (sessions: ExerciseSession[]) => {
  const cutoff = new Date(sessions[sessions.length - 1].date.getTime() - MONTH_MS);
  const monthly = sessions.filter((session) => session.date.getTime() >= cutoff.getTime());
  if (monthly.length >= 2) return monthly;
  return sessions.slice(-Math.max(2, monthly.length));
};

const getGainToneClassName = (gain: number) => {
  if (gain > 0) return "text-emerald-600 dark:text-emerald-400";
  if (gain < 0) return "text-rose-600 dark:text-rose-400";
  return "text-slate-400 dark:text-slate-500";
};

const getGainBadgeClassName = (gain: number) => {
  if (gain > 0)
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  if (gain < 0) return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
  return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
};

const getGainDirectionIcon = (gain: number) => {
  if (gain > 0) return "↑";
  if (gain < 0) return "↓";
  return "—";
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

const formatSessionDate = (date: Date) =>
  date.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
  });

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
          const monthAnchor = findMonthAnchor(exercise.sessions);
          const isBodyweight = isBodyweightExercise(exercise.sessions);

          const startValue = getSessionValue(first, isBodyweight);
          const monthValue = getSessionValue(monthAnchor, isBodyweight);
          const currentValue = getSessionValue(last, isBodyweight);

          const totalGain = Math.round((currentValue - startValue) * 2) / 2;
          const monthGain = Math.round((currentValue - monthValue) * 2) / 2;
          const monthGainPercent =
            monthValue === 0 ? 0 : Math.round((monthGain / monthValue) * 100);

          const colors = groupColors[exercise.group] || defaultColor;
          const isSelected =
            selectedExercise === exercise.name && selectedMuscleGroup === exercise.group;
          const cardId = getExerciseCardId(exercise);
          const isExpanded = expandedCard === cardId;
          const expandButtonState = getExpandButtonState(isExpanded);
          const ExpandIcon = expandButtonState.Icon;
          const prSessionIndices = getPRSessionIndices(exercise.sessions, isBodyweight);

          const monthSessions = getLastMonthSessions(exercise.sessions);
          const sparklineValues = monthSessions.map((session) =>
            getSessionValue(session, isBodyweight)
          );

          const unitLabel = getSessionUnitLabel(last, isBodyweight);
          const currentSecondaryLabel = isBodyweight ? "" : `${last.reps} חזרות`;
          const startSecondaryLabel = isBodyweight ? "" : `${first.reps} חזרות`;
          const monthSecondaryLabel = isBodyweight ? "" : `${monthAnchor.reps} חזרות`;

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

                <div className="mt-3 grid grid-cols-3 divide-x divide-x-reverse divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <MetricColumn
                    label="התחלה"
                    dateLabel={formatSessionDate(first.date)}
                    value={startValue}
                    unit={unitLabel}
                    secondary={startSecondaryLabel}
                    tone="muted"
                  />
                  <MetricColumn
                    label="לפני חודש"
                    dateLabel={formatSessionDate(monthAnchor.date)}
                    value={monthValue}
                    unit={unitLabel}
                    secondary={monthSecondaryLabel}
                    tone="muted"
                  />
                  <MetricColumn
                    label="נוכחי"
                    dateLabel={formatSessionDate(last.date)}
                    value={currentValue}
                    unit={unitLabel}
                    secondary={currentSecondaryLabel}
                    tone="accent"
                  />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-bold ${getGainBadgeClassName(
                      monthGain
                    )}`}
                  >
                    {getGainDirectionIcon(monthGain)} {Math.abs(monthGain)} {unitLabel} · חודש
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-bold ${getGainBadgeClassName(
                      totalGain
                    )}`}
                  >
                    {getGainDirectionIcon(totalGain)} {Math.abs(totalGain)} {unitLabel} · מתחילת
                    ליווי
                  </span>
                  {monthValue !== 0 && (
                    <span className={`ms-auto font-semibold ${getGainToneClassName(monthGain)}`}>
                      {monthGainPercent > 0 && "+"}
                      {monthGainPercent}% החודש
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>{formatSessionDate(monthSessions[0].date)}</span>
                    <span className="font-semibold uppercase tracking-wider">החודש האחרון</span>
                    <span>{formatSessionDate(monthSessions[monthSessions.length - 1].date)}</span>
                  </div>
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

function MetricColumn({
  label,
  dateLabel,
  value,
  unit,
  secondary,
  tone,
}: {
  label: string;
  dateLabel: string;
  value: number;
  unit: string;
  secondary?: string;
  tone: "muted" | "accent";
}) {
  const valueClassName =
    tone === "accent" ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-300";
  return (
    <div className="flex flex-col items-center px-2 py-2 text-center">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-[9px] text-slate-400 dark:text-slate-500">{dateLabel}</span>
      <span className={`mt-0.5 text-base font-bold leading-tight ${valueClassName}`}>
        {value}
        <span className="ms-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          {unit}
        </span>
      </span>
      {secondary && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400">{secondary}</span>
      )}
    </div>
  );
}
