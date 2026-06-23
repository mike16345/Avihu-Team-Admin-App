const getLineCommand = (index: number) => {
  if (index === 0) return "M";
  return "L";
};

export function MiniSparkline({ values, gradient }: { values: number[]; gradient: string }) {
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
    .map((p, i) => `${getLineCommand(i)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
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
