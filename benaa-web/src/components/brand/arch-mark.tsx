/** The Benaa mark: a Roman-arch gateway of voussoirs and brick courses with a brick-red keystone. */
type Tone = "a" | "b" | "key";
interface Piece { points: string; tone: Tone }

const R_OUT = 300;
const R_IN = 170;
const PH = 290;

function segment(from: number, to: number): string {
  const steps = 10;
  const rad = (d: number) => (d * Math.PI) / 180;
  const outer: string[] = [];
  const inner: string[] = [];
  for (let k = 0; k <= steps; k++) {
    const a = rad(from + ((to - from) * k) / steps);
    outer.push(`${(R_OUT * Math.cos(a)).toFixed(1)},${(-R_OUT * Math.sin(a)).toFixed(1)}`);
    inner.push(`${(R_IN * Math.cos(a)).toFixed(1)},${(-R_IN * Math.sin(a)).toFixed(1)}`);
  }
  return [...outer, ...inner.reverse()].join(" ");
}

const rect = (x: number, y: number, w: number, h: number) => `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;

const PIECES: Piece[] = (() => {
  const out: Piece[] = [];
  for (let i = 0; i < 9; i++) {
    out.push({ points: segment(180 - i * 20 - 1.7, 180 - (i + 1) * 20 + 1.7), tone: i === 4 ? "key" : i % 2 === 0 ? "a" : "b" });
  }
  const courses = 4;
  const gap = 8;
  const h = (PH - (courses - 1) * gap) / courses;
  for (let c = 0; c < courses; c++) {
    const y = 8 + c * (h + gap);
    out.push({ points: rect(-R_OUT, y, R_OUT - R_IN, h), tone: c % 2 === 0 ? "a" : "b" });
    out.push({ points: rect(R_IN, y, R_OUT - R_IN, h), tone: c % 2 === 0 ? "b" : "a" });
  }
  out.push({ points: rect(-R_OUT - 40, 8 + PH + 12, 2 * (R_OUT + 40), 22), tone: "a" });
  return out;
})();

export function ArchMark({ light = false, className }: { light?: boolean; className?: string }) {
  const fill: Record<Tone, string> = light
    ? { a: "#14171A", b: "#2B3238", key: "#C8402B" }
    : { a: "#EAD9B5", b: "#DFC99D", key: "#C8402B" };
  return (
    <svg viewBox="-340 -300 680 632" className={className} aria-hidden="true">
      {PIECES.map((p, i) => (
        <polygon key={i} points={p.points} fill={fill[p.tone]} />
      ))}
    </svg>
  );
}
