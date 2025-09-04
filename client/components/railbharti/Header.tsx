import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const nav = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/ai-control", label: "AI Control" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="group inline-flex items-center gap-2">
          <span className="text-xl md:text-2xl font-extrabold tracking-wide bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow">
            Railभारती
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={() =>
                cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:text-primary",
                  "text-muted-foreground",
                )
              }
              style={({ isActive }) =>
                isActive || pathname === n.to
                  ? {
                      backgroundColor: "rgba(26,32,46,0.5)",
                      borderRadius: "7.6px",
                      boxShadow:
                        "rgba(0, 247, 255, 0.6) 0px 0px 8px 0px, rgba(0, 247, 255, 0.4) 0px 0px 20px 0px, rgba(0, 247, 255, 0.25) 0px 0px 40px 0px",
                      color: "rgb(0, 247, 255)",
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "20px",
                      transitionDuration: "0.15s",
                      transitionProperty:
                        "color, background-color, border-color, text-decoration-color, fill, stroke",
                      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    }
                  : undefined
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="md:hidden">
          <Button
            variant="secondary"
            size="icon"
            className="neon-glow-cyan"
            onClick={() => setOpen((s) => !s)}
            aria-label="Toggle navigation"
          >
            {open ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/80">
          <div className="container py-2 grid gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={() =>
                  cn(
                    "px-3 py-2 rounded-md",
                    "text-muted-foreground hover:text-primary",
                  )
                }
                style={({ isActive }) =>
                  isActive || pathname === n.to
                    ? {
                        backgroundColor: "rgba(26,32,46,0.5)",
                        borderRadius: "7.6px",
                        boxShadow:
                          "rgba(0, 247, 255, 0.6) 0px 0px 8px 0px, rgba(0, 247, 255, 0.4) 0px 0px 20px 0px, rgba(0, 247, 255, 0.25) 0px 0px 40px 0px",
                        color: "rgb(0, 247, 255)",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        transitionDuration: "0.15s",
                        transitionProperty:
                          "color, background-color, border-color, text-decoration-color, fill, stroke",
                        transitionTimingFunction:
                          "cubic-bezier(0.4, 0, 0.2, 1)",
                      }
                    : undefined
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
