import { useState } from "react";

import type { ExerciseDetailSession } from "./workoutProgressionModel";

type TrendPoint = {
  date: string;
  value: number;
};

type TrendCoordinate = TrendPoint & {
  x: number;
  y: number;
};

const CHART_WIDTH = 600;
const CHART_HEIGHT = 180;
const PAD_X = 5;
const PAD_TOP = 14;
const PAD_BOTTOM = 10;

const isBodyweightExercise = (sessions: ExerciseDetailSession[]) =>
  sessions.every((session) => session.sets.every((set) => !set.weight));

const getUnit = (isBodyweight: boolean) => {
  if (isBodyweight) return "חזרות";
  return "ק״ג";
};

const getSessionTrendValue = (session: ExerciseDetailSession, isBodyweight: boolean) => {
  if (isBodyweight) return Math.max(...session.sets.map((set) => set.reps || 0));
  return Math.max(...session.sets.map((set) => set.weight || 0));
};

const getTrendPoints = (sessions: ExerciseDetailSession[], isBodyweight: boolean) =>
  [...sessions]
    .map((session) => ({
      date: session.date,
      value: getSessionTrendValue(session, isBodyweight),
    }))
    .reverse();

const getValuePadding = (min: number, max: number) => {
  if (min === max) return Math.max(min * 0.05, 0.5);
  return (max - min) * 0.12;
};

const getPathCommand = (coordinate: TrendCoordinate, index: number) => {
  let command = "L";

  if (index === 0) {
    command = "M";
  }

  return `${command} ${coordinate.x.toFixed(1)} ${coordinate.y.toFixed(1)}`;
};

const getHoveredPoint = (coords: TrendCoordinate[], hoverIdx: number | null) => {
  if (hoverIdx === null) return null;
  return coords[hoverIdx];
};

const getPointRadius = (isHovered: boolean) => {
  if (isHovered) return 5;
  return 3.5;
};

export function PRTrendChart({ sessions }: { sessions: ExerciseDetailSession[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (sessions.length === 0) {
    return (
      <p className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">אין נתונים</p>
    );
  }

  const isBodyweight = isBodyweightExercise(sessions);
  const unit = getUnit(isBodyweight);
  const points = getTrendPoints(sessions, isBodyweight);

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

  const innerW = CHART_WIDTH - PAD_X * 2;
  const innerH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const min = Math.min(...points.map((point) => point.value));
  const max = Math.max(...points.map((point) => point.value));
  const padding = getValuePadding(min, max);
  const yMin = Math.max(0, min - padding);
  const yMax = max + padding;
  const range = yMax - yMin || 1;
  const stepX = innerW / Math.max(1, points.length - 1);
  const coords = points.map((point, index) => ({
    x: PAD_X + index * stepX,
    y: PAD_TOP + innerH - ((point.value - yMin) / range) * innerH,
    date: point.date,
    value: point.value,
  }));
  const linePath = coords.map(getPathCommand).join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${
    CHART_HEIGHT - PAD_BOTTOM
  } L ${coords[0].x} ${CHART_HEIGHT - PAD_BOTTOM} Z`;
  const hovered = getHoveredPoint(coords, hoverIdx);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
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
        {coords.map((coordinate, index) => {
          const isHovered = hoverIdx === index;

          return (
            <g key={index}>
              <circle
                cx={coordinate.x}
                cy={coordinate.y}
                r="14"
                fill="transparent"
                onMouseEnter={() => setHoverIdx(index)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ cursor: "pointer" }}
              />
              <circle
                cx={coordinate.x}
                cy={coordinate.y}
                r={getPointRadius(isHovered)}
                fill="#fff"
                stroke="#3b82f6"
                strokeWidth="2"
                pointerEvents="none"
              />
            </g>
          );
        })}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs shadow-lg"
          style={{
            left: `${(hovered.x / CHART_WIDTH) * 100}%`,
            top: `${(hovered.y / CHART_HEIGHT) * 100}%`,
            transform: "translate(-50%, calc(-100% - 10px))",
          }}
        >
          <p className="font-bold text-slate-900 dark:text-slate-100">
            {hovered.value} {unit}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{hovered.date}</p>
        </div>
      )}

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
