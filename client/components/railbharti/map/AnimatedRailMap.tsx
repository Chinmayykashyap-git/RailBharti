import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useBeep } from "@/hooks/useAudio";

type Train = {
  id: string;
  name: string;
  path: "A" | "B";
  type: "Rajdhani" | "Shatabdi" | "Express" | "Local";
  speed: number; // px per second along path length
  t: number; // 0..1 position along path
  status: "On-time" | "Delayed" | "Stopped";
  occupancy?: number; // 0..100
};

const stationsA = [
  { name: "Delhi", t: 0.05, acc: true },
  { name: "Agra", t: 0.18, acc: false },
  { name: "Jhansi", t: 0.32, acc: true },
  { name: "Bhopal", t: 0.48, acc: true },
  { name: "Itarsi", t: 0.6, acc: false },
  { name: "Nagpur", t: 0.72, acc: true },
  { name: "Balharshah", t: 0.82, acc: false },
  { name: "Secunderabad", t: 0.92, acc: true },
  { name: "Hyderabad", t: 0.95, acc: true },
];

const stationsB = [
  { name: "Mumbai", t: 0.06, acc: true },
  { name: "Surat", t: 0.18, acc: false },
  { name: "Vadodara", t: 0.28, acc: true },
  { name: "Ahmedabad", t: 0.36, acc: false },
  { name: "Ajmer", t: 0.48, acc: true },
  { name: "Jaipur", t: 0.56, acc: false },
  { name: "Alwar", t: 0.64, acc: true },
  { name: "Mathura", t: 0.76, acc: true },
  { name: "Delhi", t: 0.9, acc: true },
];

const initialTrains: Train[] = [
  { id: "12001", name: "Shatabdi", path: "A", type: "Shatabdi", speed: 120, t: 0.1, status: "On-time", occupancy: 62 },
  { id: "12951", name: "Rajdhani", path: "B", type: "Rajdhani", speed: 130, t: 0.3, status: "Delayed", occupancy: 85 },
  { id: "22691", name: "Superfast", path: "A", type: "Express", speed: 110, t: 0.55, status: "On-time", occupancy: 44 },
  { id: "17018", name: "Exp", path: "B", type: "Local", speed: 100, t: 0.7, status: "On-time", occupancy: 28 },
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
  const containerRef = useRef<HTMLDivElement | null>(null);

  const beep = useBeep();

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  // Controls
  const [play, setPlay] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPredictions, setShowPredictions] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState<"day" | "night">("night");
  const [hoveredStation, setHoveredStation] = useState<null | (typeof stationsA[0] & { x?: number; y?: number })>(null);

  // Simple simulation loop with play/pause and speed
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * simSpeed;
      last = now;
      if (play) {
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
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, simSpeed]);

  // Periodically simulate random delays and notify
  useEffect(() => {
    // Update exactly one train every 5 seconds
    const id = setInterval(() => {
      setTrains((prev) => {
        const i = Math.floor(Math.random() * prev.length);
        const t = prev[i];
        const nextStatus = Math.random() < 0.6 ? "On-time" : Math.random() < 0.5 ? "Delayed" : "Stopped";
        const copy = [...prev];
        copy[i] = { ...t, status: nextStatus, occupancy: Math.min(98, Math.max(10, (t.occupancy || 30) + (nextStatus === "Delayed" ? 12 : nextStatus === "Stopped" ? 25 : -8) + Math.round(Math.random() * 12 - 6))) };

        // notify
        if (nextStatus === "Delayed") {
          toast.warning(`${t.name} (${t.id}) delayed`, { description: `Predicted delay on path ${t.path}` });
          beep(440, 0.08, 0.03);
        } else if (nextStatus === "Stopped") {
          toast.error(`${t.name} (${t.id}) stopped`, { description: `Emergency stop detected` });
          beep(220, 0.12, 0.05);
        } else {
          toast.success(`${t.name} (${t.id}) on-time`);
          beep(880, 0.06, 0.02);
        }

        return copy;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [beep]);

  // Zoom & pan handlers
  const onWheel = (e: React.WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    const delta = -e.deltaY;
    setScale((s) => {
      const ns = Math.min(3, Math.max(0.6, s + delta * 0.0015));
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

  // Compute station nodes with positions if paths available
  const stationNodes = (
    pathRef: React.RefObject<SVGPathElement>,
    list: { name: string; t: number; acc: boolean }[],
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
        <g
          key={s.name}
          onMouseEnter={() => setHoveredStation({ ...s, x: p.x, y: p.y })}
          onMouseLeave={() => setHoveredStation(null)}
        >
          <circle cx={p.x} cy={p.y} r={4} className="fill-primary drop-shadow" />
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

  // helper: compute time to reach a station for a train
  const timeToStation = (train: Train, stationT: number, pathRef: React.RefObject<SVGPathElement>) => {
    const path = pathRef.current;
    if (!path) return Infinity;
    const L = path.getTotalLength();
    const trainLen = train.t * L;
    const stationLen = stationT * L;
    let delta = stationLen - trainLen;
    if (delta < 0) delta += L; // loop
    // seconds = delta * L_pixels / pxPerSec => but delta is in px already; divide by px/sec
    const seconds = delta / train.speed;
    return Math.round(seconds / 60); // minutes approx
  };

  // convert svg point to screen pixel for positioning hover popup
  const svgPointToScreen = (x: number, y: number) => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return { left: 0, top: 0 };
    const pt = svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const matrix = svg.getScreenCTM();
    if (!matrix) return { left: 0, top: 0 };
    const transformed = pt.matrixTransform(matrix);
    return { left: transformed.x, top: transformed.y };
  };

  // Ghost predictions for trains: show future positions as translucent circles
  const ghostTrains = useMemo(() => {
    if (!showPredictions) return [] as { id: string; x: number; y: number; opacity: number }[];
    return trains.flatMap((t) => {
      // produce up to 3 future points
      const points: { id: string; x: number; y: number; opacity: number }[] = [];
      const ref = t.path === "A" ? pathARef : pathBRef;
      const path = ref.current;
      if (!path) return points;
      const L = path.getTotalLength();
      for (let s = 1; s <= 3; s++) {
        const futureT = (t.t + (s * 0.05 * (t.speed / 120))) % 1;
        const p = path.getPointAtLength(futureT * L);
        points.push({ id: t.id + "-g" + s, x: p.x, y: p.y, opacity: 0.22 - s * 0.05 });
      }
      return points;
    });
  }, [trains, showPredictions]);

  // Play arrival sound when train crosses a station
  const lastCrossRef = useRef<Record<string, number>>({});
  useEffect(() => {
    trains.forEach((t) => {
      const pathRef = t.path === "A" ? pathARef : pathBRef;
      const path = pathRef.current;
      if (!path) return;
      const L = path.getTotalLength();
      const posPx = t.t * L;
      const stations = t.path === "A" ? stationsA : stationsB;
      stations.forEach((s) => {
        const sPx = s.t * L;
        const dist = Math.abs(sPx - posPx);
        const id = `${t.id}-${s.name}`;
        if (dist < 16) {
          const last = lastCrossRef.current[id] || 0;
          const now = Date.now();
          if (now - last > 8000) {
            // announce arrival
            toast(`${t.name} arriving ${s.name}`, { description: `${t.id} - occupancy ${t.occupancy}%` });
            beep(880, 0.06, 0.03);
            lastCrossRef.current[id] = now;
          }
        }
      });
    });
  }, [trains, beep]);

  const popupPos = hoveredStation ? svgPointToScreen(hoveredStation.x || 0, hoveredStation.y || 0) : { left: 0, top: 0 };

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full overflow-hidden rounded-xl border border-border/60 bg-secondary/40 relative",
        compact ? "p-1" : "p-2",
      )}
      style={{ height }}
    >
      {/* Controls overlay */}
      <div className="absolute left-3 top-3 z-40 flex flex-col gap-2">
        <button
          onClick={() => setPlay((p) => !p)}
          className="rounded-md bg-background/60 px-3 py-1 text-xs neon-glow-cyan"
        >
          {play ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => setShowHeatmap((s) => !s)}
          className="rounded-md bg-background/60 px-3 py-1 text-xs"
        >
          Heatmap: {showHeatmap ? "On" : "Off"}
        </button>
        <button
          onClick={() => setShowPredictions((s) => !s)}
          className="rounded-md bg-background/60 px-3 py-1 text-xs"
        >
          Predictions: {showPredictions ? "On" : "Off"}
        </button>
        <button
          onClick={() => setTimeOfDay((t) => (t === "night" ? "day" : "night"))}
          className="rounded-md bg-background/60 px-3 py-1 text-xs"
        >
          Mode: {timeOfDay}
        </button>
      </div>

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
        </defs>

        {/* Background subtle gradient changes for day/night */}
        <rect x={0} y={0} width={viewBox.w} height={viewBox.h} fill={timeOfDay === "night" ? "#061123" : "#eaf6ff"} opacity={timeOfDay === "night" ? 1 : 0.18} />

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

          {/* Heatmap overlay: concentric circles at stations scaled by simulated occupancy */}
          {showHeatmap && (
            <g>
              {(pathARef.current ? stationsA : []).map((s, i) => {
                const path = pathARef.current!
                const p = path.getPointAtLength(s.t * path.getTotalLength());
                // occupancy estimated by averaging nearby trains
                const occ = Math.round(
                  Math.max(10, Math.min(95, (trains.filter((tr) => tr.path === "A").reduce((acc, tr) => acc + (tr.occupancy || 30), 0) / Math.max(1, trains.filter((tr) => tr.path === "A").length)) + (i % 3) * 6)),
                );
                const r = 18 + (occ / 100) * 28;
                const opacity = Math.min(0.45, 0.08 + occ / 250);
                return <circle key={s.name + "-heat"} cx={p.x} cy={p.y} r={r} fill="hsl(var(--accent))" opacity={opacity} />;
              })}
              {(pathBRef.current ? stationsB : []).map((s, i) => {
                const path = pathBRef.current!
                const p = path.getPointAtLength(s.t * path.getTotalLength());
                const occ = Math.round(
                  Math.max(10, Math.min(95, (trains.filter((tr) => tr.path === "B").reduce((acc, tr) => acc + (tr.occupancy || 30), 0) / Math.max(1, trains.filter((tr) => tr.path === "B").length)) + (i % 2) * 8)),
                );
                const r = 18 + (occ / 100) * 28;
                const opacity = Math.min(0.45, 0.06 + occ / 240);
                return <circle key={s.name + "-heatb"} cx={p.x} cy={p.y} r={r} fill="hsl(var(--primary))" opacity={opacity} />;
              })}
            </g>
          )}

          {/* Glowing active AI suggested path */}
          <path
            d="M 200 460 C 360 380, 520 380, 700 260"
            className="fill-none stroke-[hsl(var(--accent))]"
            strokeWidth={4}
            strokeDasharray="10 10"
            filter="url(#glowCyan)"
          />

          {/* Stations labels in zig-zag */}
          {stationNodes(pathARef, stationsA)}
          {stationNodes(pathBRef, stationsB)}

          {/* Ghost predicted trains */}
          {ghostTrains.map((g) => (
            <g key={g.id} transform={`translate(${g.x}, ${g.y})`}>
              <circle r={8} fill="hsl(var(--accent))" opacity={g.opacity} />
            </g>
          ))}

          {/* Trains */}
          {trains.map((t) => {
            const p = getPoint(t);
            const isHighlight = highlightId && highlightId === t.id;
            const color = t.type === "Rajdhani" ? "hsl(var(--primary))" : t.type === "Shatabdi" ? "hsl(var(--accent))" : t.type === "Express" ? "#f59e0b" : "#60a5fa";
            const statusColor = t.status === "On-time" ? "#34d399" : t.status === "Delayed" ? "#f59e0b" : "#fb7185";
            return (
              <g
                key={t.id}
                transform={`translate(${p.x}, ${p.y})`}
                className={cn("cursor-pointer", isHighlight && "scale-[1.12]")}
                onClick={() => setSelected(t)}
              >
                <circle r={9} fill={color} stroke={statusColor} strokeWidth={2} filter="url(#glowCyan)" />
                <rect
                  x={-16}
                  y={-6}
                  width={32}
                  height={12}
                  rx={3}
                  fill={color}
                  opacity={0.22}
                  stroke={color}
                />
                <text
                  y={-16}
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

      {/* Hover station popup absolute */}
      {hoveredStation && (
        <div
          className="absolute z-50 pointer-events-auto"
          style={{ left: popupPos.left + 8, top: popupPos.top - 40 } as any}
        >
          <div className="rounded-md bg-card/90 border border-border/60 p-3 shadow-lg w-44 text-sm text-muted-foreground">
            <div className="font-semibold text-foreground">{hoveredStation.name}</div>
            <div className="text-xs mt-1">Accessibility: {hoveredStation.acc ? "Yes" : "Partial"}</div>
            <div className="text-xs mt-2">Upcoming:</div>
            <ul className="text-xs">
              {(trains
                .filter((tr) => tr.path === (stationsA.some((s) => s.name === hoveredStation.name) ? "A" : "B"))
                .slice(0, 3)
                .map((tr) => {
                  const mins = timeToStation(tr, hoveredStation.t, tr.path === "A" ? pathARef : pathBRef);
                  return (
                    <li key={tr.id} className="flex justify-between">
                      <span>{tr.name}</span>
                      <span className="text-muted-foreground">{mins}m</span>
                    </li>
                  );
                }))}
            </ul>
          </div>
        </div>
      )}

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
                <div>Type: {selected.type}</div>
                <div>Occupancy: {selected.occupancy}%</div>
                <div>Speed: {selected.speed} px/s</div>
                <div>ETA (simulated): {Math.round((1 - selected.t) * 120)} min</div>
                <div className="flex gap-2 mt-2">
                  <button
                    className="rounded-md bg-primary text-primary-foreground px-3 py-1 neon-glow-cyan"
                    onClick={() => {
                      // simple simulate reroute: boost speed temporarily
                      setTrains((prev) => prev.map((p) => (p.id === selected.id ? { ...p, speed: p.speed + 40 } : p)));
                      toast.success("Reroute simulated — speed boosted");
                      beep(900, 0.06, 0.04);
                    }}
                  >
                    Simulate Reroute
                  </button>
                  <button
                    className="rounded-md bg-secondary/70 px-3 py-1"
                    onClick={() => {
                      // animate step-by-step journey visualization by temporarily highlighting prediction
                      toast("Visualizing journey", { description: "Step-by-step animation started" });
                    }}
                  >
                    Visualize Journey
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
