/** Dependency-free SVG line chart (renders on the server). */
export interface ChartPoint { label: string; value: number }

export function LineChart({
  points, height = 240, formatValue, formatLabel,
}: { points: ChartPoint[]; height?: number; formatValue: (n: number) => string; formatLabel: (s: string) => string }) {
  const W = 720;
  const H = height;
  const pad = { l: 12, r: 12, t: 16, b: 34 };
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => pad.l + (points.length === 1 ? 0 : (i / (points.length - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Price chart">
      {[0, 0.5, 1].map((f) => (
        <line key={f} x1={pad.l} x2={W - pad.r} y1={pad.t + f * (H - pad.t - pad.b)} y2={pad.t + f * (H - pad.t - pad.b)} stroke="hsl(var(--border))" strokeDasharray="4 4" />
      ))}
      <path d={line} fill="none" stroke="#C8402B" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.value)} r={3.5} fill="#C8402B" />
      ))}
      <text x={pad.l} y={H - 10} fontSize={12} fill="hsl(var(--muted-foreground))">{formatLabel(first.label)}</text>
      <text x={W - pad.r} y={H - 10} fontSize={12} textAnchor="end" fill="hsl(var(--muted-foreground))">{formatLabel(last.label)}</text>
      <text x={pad.l} y={12} fontSize={12} fill="hsl(var(--muted-foreground))">{formatValue(max)}</text>
      <text x={W - pad.r} y={12} fontSize={12} textAnchor="end" fill="hsl(var(--muted-foreground))">{formatValue(min)}</text>
    </svg>
  );
}
