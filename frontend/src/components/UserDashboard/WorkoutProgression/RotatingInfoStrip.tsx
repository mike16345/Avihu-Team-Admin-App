import { FC, useEffect, useRef, useState } from "react";

type Item = { label: string; icon?: React.ReactNode };

type Props = {
  items: Item[];
  intervalMs?: number;
  className?: string;
};

const FADE_MS = 350;

export const RotatingInfoStrip: FC<Props> = ({ items, intervalMs = 4500, className = "" }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<number | null>(null);
  const fadeRef = useRef<number | null>(null);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    timerRef.current = window.setInterval(() => {
      setVisible(false);
      fadeRef.current = window.setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setVisible(true);
      }, FADE_MS);
    }, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (fadeRef.current) window.clearTimeout(fadeRef.current);
    };
  }, [paused, items.length, intervalMs]);

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  if (items.length === 0) return null;

  const stop = () => setPaused(true);
  const active = items[Math.min(index, items.length - 1)];

  return (
    <button
      type="button"
      onClick={stop}
      onTouchStart={stop}
      className={`group inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 ${className}`}
      title={paused ? "הרוטציה עצרה — טאפ כדי לשחרר" : "טאפ כדי לעצור"}
    >
      <span
        className="inline-flex items-center gap-1.5 transition-all duration-300 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-4px)",
        }}
      >
        {active.icon}
        <span className="whitespace-nowrap">{active.label}</span>
      </span>
      {items.length > 1 && !paused && (
        <span className="flex gap-0.5">
          {items.map((_, i) => (
            <span
              key={i}
              className={`h-1 w-1 rounded-full transition-colors duration-300 ${
                i === index ? "bg-slate-700 dark:bg-slate-200" : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
          ))}
        </span>
      )}
    </button>
  );
};
