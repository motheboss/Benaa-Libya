/** Ghadames-style triangle band in brick red and Libyan green. */
export function TriangleBand({ height = 20, className }: { height?: number; className?: string }) {
  const h = height;
  return (
    <svg width="100%" height={h} className={className} aria-hidden="true">
      <defs>
        <pattern id="benaa-triangles" width={h * 4} height={h} patternUnits="userSpaceOnUse">
          <polygon points={`0,${h} ${h * 2},${h} ${h},0`} fill="#C8402B" />
          <polygon points={`${h * 2},${h} ${h * 4},${h} ${h * 3},0`} fill="#1F7A4D" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#benaa-triangles)" />
    </svg>
  );
}
