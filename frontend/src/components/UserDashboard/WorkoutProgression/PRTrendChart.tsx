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

const CHART_WIDTH = 720;
const CHART_HEIGHT = 220;
const PAD_TOP = 24;
const PAD_BOTTOM = 28;
const PAD_LEFT = 16;
const PAD_RIGHT = 46;
const GRID_LINES = 4;

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
  return (max - min) * 0.15;
};

const getSmoothPath = (coords: TrendCoordinate[]) => {
  if (coords.length < 2) return "";
  const first = coords[0];
  const commands = [`M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`];
  for (let index = 0; index < coords.length - 1; index += 1) {
    const previous = coords[index - 1] || coords[index];
    const current = coords[index];
    const next = coords[index + 1];
    const upcoming = coords[index + 2] || next;
    const controlOneX = current.x + (next.x - previous.x) / 6;
    const controlOneY = current.y + (next.y - previous.y) / 6;
    const controlTwoX = next.x - (upcoming.x - current.x) / 6;
    const controlTwoY = next.y - (upcoming.y - current.y) / 6;
    commands.push(
      `C ${controlOneX.toFixed(1)} ${controlOneY.toFixed(1)} ${controlTwoX.toFixed(1)} ${controlTwoY.toFixed(1)} ${next.x.toFixed(1)} ${next.y.toFixed(1)}`
    );
  }
  return commands.join(" ");
};

const formatShortDate = (raw: string) => {
  const parts = raw.split(/[./]/);
  if (parts.length < 2) return raw;
  return `${parts[0]}/${parts[1]}`;
};

const formatAxisValue = (value: number) => {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
};

const getPointRadius = (isHovered: boolean, isPeak: boolean) => {
  if (isHovered) return 5.5;
  if (isPeak) return 4.5;
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
      <div className="flex h-52 flex-col items-center justify-center">
        <p className="text-3xl font-bold text-blue-600">
          {points[0].value} {unit}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{points[0].date}</p>
      </div>
    );
  }

  const innerW = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const min = Math.min(...points.map((point) => point.value));
  const max = Math.max(...points.map((point) => point.value));
  const padding = getValuePadding(min, max);
  const yMin = Math.max(0, min - padding);
  const yMax = max + padding;
  const range = yMax - yMin || 1;
  const stepX = innerW / Math.max(1, points.length - 1);
  const coords: TrendCoordinate[] = points.map((point, index) => ({
    x: PAD_LEFT + index * stepX,
    y: PAD_TOP + innerH - ((point.value - yMin) / range) * innerH,
    date: point.date,
    value: point.value,
  }));

  const linePath = getSmoothPath(coords);
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(
    CHART_HEIGHT - PAD_BOTTOM
  ).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(CHART_HEIGHT - PAD_BOTTOM).toFixed(1)} Z`;

  const peakIndex = coords.reduce(
    (bestIndex, coord, index) => (coord.value > coords[bestIndex].value ? index : bestIndex),
    0
  );
  const hovered = hoverIdx !== null ? coords[hoverIdx] : null;

  const ticks = Array.from({ length: GRID_LINES + 1 }, (_, index) => {
    const ratio = index / GRID_LINES;
    const value = yMin + range * ratio;
    const y = PAD_TOP + innerH - ratio * innerH;
    return { y, value };
  });

  const xTickIndices =
    coords.length <= 3
      ? coords.map((_, index) => index)
      : [0, Math.floor(coords.length / 2), coords.length - 1];

  return (
    <div className="relative px-3 pb-2">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="block h-72 w-full"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="pr-trend-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pr-trend-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        {ticks.map((tick, index) => (
          <g key={tick.y}>
            <line
              x1={PAD_LEFT}
              x2={CHART_WIDTH - PAD_RIGHT}
              y1={tick.y}
              y2={tick.y}
              stroke="currentColor"
              strokeOpacity={index === GRID_LINES ? 0.18 : 0.09}
              strokeWidth="1"
              className="text-slate-500"
              strokeDasharray={index === GRID_LINES ? undefined : "2 4"}
            />
            <text
              x={CHART_WIDTH - PAD_RIGHT + 6}
              y={tick.y + 3.5}
              className="fill-slate-400 dark:fill-slate-500"
              style={{ fontSize: "10px", fontWeight: 600 }}
            >
              {formatAxisValue(tick.value)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#pr-trend-grad)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#pr-trend-line)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((coordinate, index) => {
          const isHovered = hoverIdx === index;
          const isPeak = index === peakIndex;
          const strokeColor = isPeak ? "#f59e0b" : "#2563eb";

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
              {isPeak && (
                <circle
                  cx={coordinate.x}
                  cy={coordinate.y}
                  r="8"
                  fill={strokeColor}
                  fillOpacity="0.15"
                  pointerEvents="none"
                />
              )}
              <circle
                cx={coordinate.x}
                cy={coordinate.y}
                r={getPointRadius(isHovered, isPeak)}
                fill="#fff"
                stroke={strokeColor}
                strokeWidth={isPeak ? 2.25 : 1.75}
                pointerEvents="none"
              />
            </g>
          );
        })}

        {xTickIndices.map((index) => (
          <text
            key={`x-${index}`}
            x={coords[index].x}
            y={CHART_HEIGHT - 8}
            textAnchor="middle"
            className="fill-slate-400 dark:fill-slate-500"
            style={{ fontSize: "10px", fontWeight: 600 }}
          >
            {formatShortDate(coords[index].date)}
          </text>
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs shadow-lg"
          style={{
            left: `${(hovered.x / CHART_WIDTH) * 100}%`,
            top: `${(hovered.y / CHART_HEIGHT) * 100}%`,
            transform: "translate(-50%, calc(-100% - 12px))",
          }}
        >
          <p className="font-bold text-slate-900 dark:text-slate-100">
            {hovered.value} {unit}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{hovered.date}</p>
        </div>
      )}
    </div>
  );
}
