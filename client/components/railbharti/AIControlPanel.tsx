import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useBeep } from "@/hooks/useAudio";

export default function AIControlPanel() {
  const [efficiency, setEfficiency] = useState(72);
  const beep = useBeep();

  const bump = (delta: number) => {
    setEfficiency((e) => Math.max(40, Math.min(100, e + delta)));
  };

  return (
    <section className="container py-10">
      <h2 className="text-2xl md:text-3xl font-bold">AI Control Panel</h2>
      <p className="text-muted-foreground mt-1">Simulate reroutes, congestion, and emergency scenarios</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="bg-secondary/50 border-border/60">
          <CardHeader>
            <CardTitle>Simulation</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              className="neon-glow-cyan"
              onClick={() => {
                beep(880, 0.08, 0.04);
                toast("Rerouting Rajdhani via Ajmer", { description: "ETA improved by 6%" });
                bump(+4);
              }}
            >
              Reroute
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                beep(420, 0.08, 0.04);
                toast.warning("Track congestion simulated", { description: "Delays increased near Bhopal" });
                bump(-6);
              }}
            >
              Congestion
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                beep(220, 0.1, 0.05);
                toast.error("Emergency alert triggered", { description: "Medical assistance required at Nagpur" });
                bump(-10);
              }}
            >
              Emergency
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 border-border/60 md:col-span-2">
          <CardHeader>
            <CardTitle>Efficiency Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">Overall scheduling efficiency</div>
            <div className="h-3 w-full rounded bg-secondary/60 overflow-hidden">
              <div
                className="h-full bg-[hsl(var(--primary))] transition-all"
                style={{ width: `${efficiency}%` }}
              />
            </div>
            <div className="mt-2 text-sm"><span className="font-semibold text-primary">{efficiency}%</span> optimized</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
