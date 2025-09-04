import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

export default function DashboardSection() {
  const [data, setData] = useState(() => gen());
  useEffect(() => {
    const id = setInterval(() => setData(gen()), 2500);
    return () => clearInterval(id);
  }, []);

  const kpis = [
    { label: "On-time", value: 124, color: "text-emerald-300" },
    { label: "Delayed", value: 18, color: "text-amber-300" },
    { label: "Avg Speed", value: "82 km/h", color: "text-primary" },
    { label: "Routes", value: 42, color: "text-accent" },
  ];

  return (
    <section className="container py-10">
      <h2 className="text-2xl md:text-3xl font-bold">Live Dashboard</h2>
      <p className="text-muted-foreground mt-1">Real-time stats and AI predictions</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="bg-secondary/50 border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{k.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-extrabold", k.color)}>{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-secondary/50 border-border/60">
          <CardHeader>
            <CardTitle>Predicted Delay Index</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Area type="monotone" dataKey="v" stroke="hsl(var(--accent))" fill="url(#c)" strokeWidth={2} isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-secondary/50 border-border/60">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground grid gap-2">
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[hsl(var(--primary))]"/> Express</label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[hsl(var(--primary))]"/> Passenger</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-[hsl(var(--primary))]"/> Freight</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-[hsl(var(--primary))]"/> Metro</label>
            <div className="text-xs">Region: <span className="text-foreground">North, West</span></div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function gen() {
  const now = Date.now();
  return Array.from({ length: 24 }, (_, i) => ({ t: i, v: Math.round(30 + 20 * Math.sin((now / 1000 + i) / 2) + Math.random() * 10) }));
}
