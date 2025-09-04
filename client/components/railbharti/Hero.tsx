import { useMemo, useState } from "react";
import AnimatedRailMap from "./map/AnimatedRailMap";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useBeep } from "@/hooks/useAudio";

export default function Hero() {
  const [query, setQuery] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const beep = useBeep();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = query.trim();
    if (!id) return;
    setHighlightId(id);
    toast.success(`Focusing train ${id}`, {
      description: "Zooming to the train on map",
    });
    beep(1200, 0.08, 0.04);
  };

  return (
    <section className="relative">
      <div className="container pt-10 pb-6 grid gap-6">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Railभारती
              </span>{" "}
              — Indian Rail Essence
            </h1>
            <p className="mt-4 text-muted-foreground max-w-prose">
              A modern, interactive, AI-powered railway prototype with real-time train motion, predictions, and a futuristic neon interface.
            </p>
            <form onSubmit={onSearch} className="mt-6 flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search train by number, name, or route"
                className="w-full rounded-md bg-secondary/60 border border-border/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/60"
              />
              <Button className="neon-glow-cyan" type="submit">Search</Button>
            </form>
            <div className="mt-3 text-xs text-muted-foreground">
              Try: 12001, 12951, Shatabdi, Rajdhani
            </div>
          </div>
          <div className="relative">
            <AnimatedRailMap height={420} highlightId={highlightId} />
            <div className="absolute top-3 right-3">
              <AIHelper />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AIHelper() {
  const beep = useBeep();
  return (
    <button
      onClick={() => {
        beep(660, 0.1, 0.04);
        toast("AI Tip", {
          description:
            "Predicted congestion on Path A near Bhopal. Reroute Rajdhani via Ajmer.",
          action: {
            label: "Reroute",
            onClick: () => {
              beep(990, 0.08, 0.04);
              toast.success("Rerouted successfully");
            },
          },
        });
      }}
      className={cn(
        "relative rounded-full bg-secondary/70 border border-border/60 p-3 text-accent",
        "hover:bg-secondary/90 transition-colors animate-pulse-glow",
      )}
      aria-label="AI Assistant"
      title="AI Assistant"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5a1 1 0 112 0v1a1 1 0 11-2 0V7zm-4 0a1 1 0 112 0v1a1 1 0 11-2 0V7zm-1 7a1 1 0 100 2h8a1 1 0 100-2H8z" />
      </svg>
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent animate-ping"></span>
    </button>
  );
}
