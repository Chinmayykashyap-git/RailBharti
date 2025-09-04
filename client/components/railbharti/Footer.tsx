import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import AnimatedRailMap from "./map/AnimatedRailMap";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/60 backdrop-blur">
      <div className="container py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-extrabold text-lg bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Railभारती 🚆
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            Indian Rail Essence — a futuristic, interactive prototype for real-time train tracking and AI-powered insights.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className={cn("text-sm text-muted-foreground hover:text-primary")}
            >
              GitHub
            </a>
            <a
              href="mailto:contact@railbharti.app"
              className={cn("text-sm text-muted-foreground hover:text-primary")}
            >
              contact@railbharti.app
            </a>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="text-sm text-muted-foreground mb-2">Mini Network</div>
          <div className="rounded-lg border border-border/60 bg-secondary/40 p-2">
            <AnimatedRailMap height={160} interactive={false} compact />
          </div>
        </div>
      </div>
      <div className="border-t border-border/50">
        <div className="container py-4 text-xs text-muted-foreground flex items-center justify-between">
          <span>�� {new Date().getFullYear()} Railभारती</span>
          <nav className="flex gap-4">
            <Link to="/about" className="hover:text-primary">About</Link>
            <Link to="/contact" className="hover:text-primary">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
