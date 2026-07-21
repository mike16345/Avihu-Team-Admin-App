import { useMemo, useState } from "react";
import { FaChevronDown, FaXmark } from "react-icons/fa6";

import { ExerciseGoals } from "./ExerciseGoals";
import { MonthlyPRs } from "./MonthlyPRs";
import { PRTrendChart } from "./PRTrendChart";
import {
  defaultColor,
  groupColors,
  MONTH_NAMES,
  type ExerciseDetailSession,
  type ExerciseDetailSet,
  type FlatExercise,
} from "./workoutProgressionModel";
import { groupExerciseDetailSessions } from "./workoutProgressionUtils";

type ExerciseDetailModalProps = {
  exercise: FlatExercise;
  rawSets: any[];
  onClose: () => void;
};

const getOpenSessionBorderClassName = (isOpen: boolean) => {
  if (isOpen) return "border-blue-200 dark:border-blue-900/60 shadow-md";
  return "border-slate-200 dark:border-slate-800";
};

const getDateBadgeClassName = (isOpen: boolean) => {
  if (isOpen) return "bg-blue-600 text-white shadow-sm";
  return "border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200";
};

const getDateBadgeMonthClassName = (isOpen: boolean) => {
  if (isOpen) return "text-white/80";
  return "text-slate-400 dark:text-slate-500";
};

const getDateBadgeDayClassName = (isOpen: boolean) => {
  if (isOpen) return "text-white";
  return "text-slate-900 dark:text-slate-100";
};

const getDateBadgeYearClassName = (isOpen: boolean) => {
  if (isOpen) return "text-white/70";
  return "text-slate-400 dark:text-slate-500";
};

const getChevronRotationClassName = (isOpen: boolean) => {
  if (isOpen) return "";
  return "-rotate-90";
};

const getSetRowBorderClassName = (isSessionPR: boolean) => {
  if (isSessionPR) return "border-blue-300 bg-blue-50/40";
  return "border-slate-200 dark:border-slate-800";
};

const getSetNumberBadgeClassName = (isSessionPR: boolean) => {
  if (isSessionPR) return "bg-blue-600 text-white";
  return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200";
};

const getTrendBadgeClassName = (totalGain: number) => {
  if (totalGain > 0) {
    return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300";
  }

  return "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300";
};

const getTrendPrefix = (totalGain: number) => {
  if (totalGain > 0) return "↑ +";
  return "↓ ";
};

const getSessionMaxWeight = (session: ExerciseDetailSession) =>
  Math.max(...session.sets.map((set) => set.weight));

const getFirstSessionMaxWeight = (sessions: ExerciseDetailSession[]) => {
  const firstSession = sessions[0];
  if (!firstSession) return 0;
  return getSessionMaxWeight(firstSession);
};

const getLastSessionMaxWeight = (sessions: ExerciseDetailSession[]) => {
  const lastSession = sessions[sessions.length - 1];
  if (!lastSession) return 0;
  return getSessionMaxWeight(lastSession);
};

const isSessionRecordSet = (set: ExerciseDetailSet, sessionMaxWeight: number) =>
  set.weight === sessionMaxWeight && set.weight > 0;

const getNextOpenDate = (isOpen: boolean, sessionDate: string) => {
  if (isOpen) return null;
  return sessionDate;
};

export function ExerciseDetailModal({ exercise, rawSets, onClose }: ExerciseDetailModalProps) {
  const colors = groupColors[exercise.group] || defaultColor;
  const sessions = useMemo(() => groupExerciseDetailSessions(rawSets), [rawSets]);

  const [openDate, setOpenDate] = useState<string | null>(
    sessions[sessions.length - 1]?.date || null
  );

  const firstPR = getFirstSessionMaxWeight(sessions);
  const lastPR = getLastSessionMaxWeight(sessions);
  const totalGain = +(lastPR - firstPR).toFixed(1);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-7xl flex-col gap-4 overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 font-heebo shadow-2xl"
        onClick={(event) => event.stopPropagation()}
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

        <div className="grid h-[calc(90vh-140px)] min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[7fr_3fr]">
          <div className="modal-sets-scroll flex h-full min-h-0 flex-col gap-3 overflow-y-scroll rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 p-3 pe-2 lg:order-2">
            {sessions.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                אין סטים מתועדים לתרגיל זה
              </p>
            )}
            {[...sessions].reverse().map((session) => {
              const isOpen = openDate === session.date;
              const [day, month, year] = session.date.split(/[./]/);
              const monthName = MONTH_NAMES[Number(month) - 1] || "";
              const sessionMaxWeight = getSessionMaxWeight(session);

              return (
                <div
                  key={session.date}
                  className={`shrink-0 overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all ${getOpenSessionBorderClassName(
                    isOpen
                  )}`}
                >
                  <button
                    onClick={() => setOpenDate(getNextOpenDate(isOpen, session.date))}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl text-center leading-none ${getDateBadgeClassName(
                          isOpen
                        )}`}
                      >
                        <span
                          className={`text-[9px] font-semibold uppercase tracking-wider ${getDateBadgeMonthClassName(
                            isOpen
                          )}`}
                        >
                          {monthName}
                        </span>
                        <span className={`text-xl font-bold ${getDateBadgeDayClassName(isOpen)}`}>
                          {day}
                        </span>
                        <span
                          className={`text-[8px] font-medium ${getDateBadgeYearClassName(isOpen)}`}
                        >
                          {year}
                        </span>
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {session.sets.length} סטים
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          שיא: {sessionMaxWeight} ק״ג
                        </span>
                      </div>
                    </div>
                    <FaChevronDown
                      size={11}
                      className={`shrink-0 text-slate-400 dark:text-slate-500 transition-transform ${getChevronRotationClassName(
                        isOpen
                      )}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800 p-2.5">
                      {session.sets.map((set, index) => {
                        const isSessionPR = isSessionRecordSet(set, sessionMaxWeight);

                        return (
                          <div
                            key={index}
                            className={`flex items-center gap-2 rounded-lg border bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs ${getSetRowBorderClassName(
                              isSessionPR
                            )}`}
                          >
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${getSetNumberBadgeClassName(
                                isSessionPR
                              )}`}
                            >
                              {set.setNumber}
                            </span>
                            <div className="flex flex-1 items-center justify-between gap-2">
                              <div className="flex items-baseline gap-3">
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                  {set.weight}{" "}
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    ק״ג
                                  </span>
                                </span>
                                <span className="text-slate-700 dark:text-slate-200">
                                  {set.reps}{" "}
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    חזרות
                                  </span>
                                </span>
                              </div>
                              {set.program && (
                                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                  {set.program}
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
            <div className="shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-0 pb-5 pt-5">
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
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getTrendBadgeClassName(
                      totalGain
                    )}`}
                  >
                    {getTrendPrefix(totalGain)}
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
