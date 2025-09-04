import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Train = {
  id: string;
  name: string;
  path: "A" | "B";
  speed: number; // px per second along path length
  t: number; // 0..1 position along path
  status: "On-time" | "Delayed" | "Stopped";
};

const stationsA = [
  { name: "Delhi", t: 0.05 },
  { name: "Agra", t: 0.18 },
  { name: "Jhansi", t: 0.32 },
  { name: "Bhopal", t: 0.48 },
  { name: "Itarsi", t: 0.6 },
  { name: "Nagpur", t: 0.72 },
  { name: "Balharshah", t: 0.82 },
  { name: "Secunderabad", t: 0.92 },
  { name: "Hyderabad", t: 0.95 },
];

const stationsB = [
  { name: "Mumbai", t: 0.06 },
  { name: "Surat", t: 0.18 },
  { name: "Vadodara", t: 0.28 },
  { name: "Ahmedabad", t: 0.36 },
  { name: "Ajmer", t: 0.48 },
  { name: "Jaipur", t: 0.56 },
  { name: "Alwar", t: 0.64 },
  { name: "Mathura", t: 0.76 },
  { name: "Delhi", t: 0.9 },
];

const initialTrains: Train[] = [
  { id: "12001", name: "Shatabdi", path: "A", speed: 120, t: 0.1, status: "On-time" },
  { id: "12951", name: "Rajdhani", path: "B", speed: 130, t: 0.3, status: "Delayed" },
  { id: "22691", name: "Superfast", path: "A", speed: 110, t: 0.55, status: "On-time" },
  { id: "17018", name: "Exp", path: "B", speed: 100, t: 0.7, status: "On-time" },
];

export default function AnimatedRailMap({
  height = 420,
  interactive = true,
  compact = false,
  highlightId,
}: {
  height?: number;
  interactive?: boolean;
  compact?: boolean;
  highlightId?: string | null;
}) {
  const [trains, setTrains] = useState<Train[]>(initialTrains);
  const [selected, setSelected] = useState<Train | null>(null);
  const pathARef = useRef<SVGPathElement | null>(null);
  const pathBRef = useRef<SVGPathElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  // Simple simulation loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setTrains((prev) =>
        prev.map((t) => {
          const path = t.path === "A" ? pathARef.current : pathBRef.current;
          const L = path?.getTotalLength() || 1;
          const pxPerSec = t.speed;
          const d = (pxPerSec * dt) / L; // normalized
          let nt = t.t + d;
          if (nt > 1) nt = nt - 1; // loop
          return { ...t, t: nt };
        }),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Zoom & pan handlers
  const onWheel = (e: React.WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    const delta = -e.deltaY;
    setScale((s) => {
      const ns = Math.min(3, Math.max(0.7, s + delta * 0.001));
      return ns;
    });
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!interactive || !drag.current) return;
    setOffset({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const viewBox = useMemo(() => ({ w: 1200, h: 600 }), []);

  const getPoint = (t: Train) => {
    const path = t.path === "A" ? pathARef.current : pathBRef.current;
    if (!path) return { x: 0, y: 0 };
    const L = path.getTotalLength();
    const p = path.getPointAtLength(t.t * L);
    return { x: p.x, y: p.y };
  };

  const stationNodes = (
    pathRef: React.RefObject<SVGPathElement>,
    list: { name: string; t: number }[],
  ) => {
    const path = pathRef.current;
    if (!path) return null;
    const L = path.getTotalLength();
    return list.map((s, i) => {
      const p = path.getPointAtLength(s.t * L);
      const normal = path.getPointAtLength(Math.min(L, s.t * L + 0.1));
      const dx = normal.x - p.x;
      const dy = normal.y - p.y;
      const angle = Math.atan2(dy, dx);
      const off = (i % 2 === 0 ? 1 : -1) * 18;
      const tx = p.x + Math.cos(angle - Math.PI / 2) * off;
      const ty = p.y + Math.sin(angle - Math.PI / 2) * off;
      return (
        <g key={s.name}>
          <circle cx={p.x} cy={p.y} r={3} className="fill-primary drop-shadow" />
          <text
            x={tx}
            y={ty}
            className="text-[10px] md:text-xs select-none fill-foreground/90 hover:fill-primary transition-colors"
            textAnchor="middle"
          >
            {s.name}
          </text>
        </g>
      );
    });
  };

  const transform = `translate(${offset.x}, ${offset.y}) scale(${scale})`;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-border/60 bg-secondary/40",
        compact ? "p-1" : "p-2",
      )}
      style={{ height }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <defs>
          <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="hsl(var(--ring))" floodOpacity="0.75" />
          </filter>
          <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" />
          </marker>
        </defs>

        <g transform={transform}>
          {/* Tracks */}
          <path
            ref={pathARef}
            d="M 60 520 C 280 400, 420 420, 600 300 C 760 200, 920 220, 1140 120"
            className="fill-none stroke-muted-foreground/40"
            strokeWidth={12}
            strokeLinecap="round"
          />
          <path
            ref={pathBRef}
            d="M 60 420 C 260 300, 420 320, 600 200 C 780 100, 940 120, 1140 60"
            className="fill-none stroke-muted-foreground/30"
            strokeWidth={10}
            strokeLinecap="round"
          />

          {/* Glowing active segments to suggest AI predictions */}
          <path
            d="M 200 460 C 360 380, 520 380, 700 260"
            className="fill-none stroke-[hsl(var(--accent))]"
            strokeWidth={4}
            strokeDasharray="10 10"
            filter="url(#glowCyan)"
            markerEnd="url(#arrow)"
          />

          {/* Stations labels in zig-zag */}
          {stationNodes(pathARef, stationsA)}
          {stationNodes(pathBRef, stationsB)}

          {/* Trains */}
          {trains.map((t) => {
            const p = getPoint(t);
            const isHighlight = highlightId && highlightId === t.id;
            return (
              <g
                key={t.id}
                transform={`translate(${p.x}, ${p.y})`}
                className={cn("cursor-pointer", isHighlight && "scale-[1.15]")}
                onClick={() => setSelected(t)}
              >
                <circle r={8} className="fill-primary" filter="url(#glowCyan)" />
                <rect
                  x={-14}
                  y={-5}
                  width={28}
                  height={10}
                  rx={3}
                  className="fill-primary/20 stroke-primary/60"
                />
                <text
                  y={-14}
                  className="text-[10px] md:text-xs fill-foreground drop-shadow"
                  textAnchor="middle"
                >
                  {t.name} ({t.id})
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="bg-secondary/80 backdrop-blur border-border/60">
          {selected && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>
                    Train {selected.name} • {selected.id}
                  </span>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      selected.status === "On-time" && "bg-emerald-400/20 text-emerald-300",
                      selected.status === "Delayed" && "bg-amber-400/20 text-amber-300",
                      selected.status === "Stopped" && "bg-rose-400/20 text-rose-300",
                    )}
                  >
                    {selected.status}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 text-sm text-muted-foreground">
                <div>Path: {selected.path}</div>
                <div>Speed: {selected.speed} px/s</div>
                <div>ETA (simulated): {Math.round((1 - selected.t) * 120)} min</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
