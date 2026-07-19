import { useEffect, useRef, useState } from "react";

/**
 * AgentLinkDiagram
 *
 * A compact animated SVG that visually demonstrates NEXUS's core mechanism:
 * two agents feeding into a shared knowledge base, with automatic cross-linking.
 *
 * The animation loops every ~4.8s and pauses when the component scrolls out of view.
 */
export function AgentLinkDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<
    "idle" | "pulse-down" | "glow" | "arc-draw" | "label-show" | "fade-out"
  >("idle");

  // ---- Intersection Observer: pause when off-screen ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ---- Animation loop ----
  useEffect(() => {
    if (!isVisible) return;

    const timings: Array<[typeof phase, number]> = [
      ["pulse-down", 0],
      ["glow", 850],
      ["arc-draw", 1250],
      ["label-show", 1900],
      ["fade-out", 3000],
      ["idle", 3450],
    ];

    const timers = timings.map(([p, ms]) =>
      setTimeout(() => setPhase(p), ms),
    );

    // Full loop restart
    const loop = setTimeout(() => setPhase("pulse-down"), 4800);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(loop);
    };
  }, [isVisible, phase === "idle" ? "restart" : ""]);

  // Kick off on mount
  useEffect(() => {
    const t = setTimeout(() => setPhase("pulse-down"), 600);
    return () => clearTimeout(t);
  }, []);

  // Phase-derived booleans for readability
  const pulsing = phase === "pulse-down";
  const glowing = phase === "glow" || phase === "arc-draw" || phase === "label-show";
  const arcVisible = phase === "arc-draw" || phase === "label-show";
  const labelVisible = phase === "label-show";
  const fadingOut = phase === "fade-out";

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-[560px] select-none px-4">
      <svg
        viewBox="0 0 560 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        aria-label="Animated diagram showing two AI agents connected through a shared knowledge base"
        role="img"
      >
        <defs>
          {/* Copper gradient for the glow */}
          <radialGradient id="nx-glow-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
          {/* Arc gradient */}
          <linearGradient id="nx-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* ====== SHARED KNOWLEDGE BASE LINE ====== */}
        <line
          x1="100" y1="165" x2="460" y2="165"
          stroke="var(--color-border)"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.6"
        />
        <text
          x="280" y="190"
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
          fontSize="11"
          fontFamily="inherit"
          letterSpacing="0.08em"
          opacity="0.7"
        >
          SHARED KNOWLEDGE BASE
        </text>

        {/* ====== RFI AGENT NODE (LEFT) ====== */}
        <g>
          {/* Outer ring glow */}
          <circle
            cx="155" cy="60" r="36"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
            opacity={glowing || arcVisible ? 0.5 : 0.15}
            style={{ transition: "opacity 400ms ease" }}
          />
          {/* Node body */}
          <circle
            cx="155" cy="60" r="28"
            fill="var(--color-primary)"
            opacity="0.08"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
          />
          {/* Icon: a small search/document icon */}
          <path
            d="M148 54 L148 66 L162 66 L162 58 L158 54 Z"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <line x1="151" y1="59" x2="159" y2="59" stroke="var(--color-primary)" strokeWidth="0.8" opacity="0.6" />
          <line x1="151" y1="62" x2="157" y2="62" stroke="var(--color-primary)" strokeWidth="0.8" opacity="0.6" />
          {/* Label */}
          <text
            x="155" y="104"
            textAnchor="middle"
            fill="var(--color-primary)"
            fontSize="12"
            fontWeight="600"
            fontFamily="inherit"
          >
            RFI Agent
          </text>
        </g>

        {/* ====== COMPLIANCE AGENT NODE (RIGHT) ====== */}
        <g>
          {/* Outer ring glow */}
          <circle
            cx="405" cy="60" r="36"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
            opacity={glowing || arcVisible ? 0.5 : 0.15}
            style={{ transition: "opacity 400ms ease" }}
          />
          {/* Node body */}
          <circle
            cx="405" cy="60" r="28"
            fill="var(--color-primary)"
            opacity="0.08"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
          />
          {/* Icon: a shield/check icon */}
          <path
            d="M405 48 L395 53 L395 61 C395 67 405 72 405 72 C405 72 415 67 415 61 L415 53 Z"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <polyline
            points="400,60 403,63 410,56"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Label */}
          <text
            x="405" y="104"
            textAnchor="middle"
            fill="var(--color-primary)"
            fontSize="12"
            fontWeight="600"
            fontFamily="inherit"
          >
            Compliance Agent
          </text>
        </g>

        {/* ====== VERTICAL CONNECTOR LINES (static) ====== */}
        <line
          x1="155" y1="96" x2="155" y2="165"
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.35"
        />
        <line
          x1="405" y1="96" x2="405" y2="165"
          stroke="var(--color-border)"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.35"
        />

        {/* ====== PULSE DOTS traveling down ====== */}
        {/* Left pulse */}
        <circle
          cx="155" r="4"
          fill="var(--color-primary)"
          opacity={pulsing ? 1 : 0}
          style={{
            transition: pulsing ? "none" : "opacity 200ms",
          }}
        >
          {pulsing && (
            <animate
              attributeName="cy"
              from="96"
              to="165"
              dur="0.8s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.16 1 0.3 1"
            />
          )}
        </circle>
        {/* Right pulse (slightly delayed) */}
        <circle
          cx="405" r="4"
          fill="var(--color-primary)"
          opacity={pulsing ? 1 : 0}
          style={{
            transition: pulsing ? "none" : "opacity 200ms",
          }}
        >
          {pulsing && (
            <animate
              attributeName="cy"
              from="96"
              to="165"
              dur="0.8s"
              begin="0.12s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.16 1 0.3 1"
            />
          )}
        </circle>

        {/* ====== GLOW POINT on the knowledge base line ====== */}
        <circle
          cx="280" cy="165" r={glowing ? 18 : 0}
          fill="url(#nx-glow-grad)"
          opacity={glowing ? 1 : 0}
          style={{
            transition: "r 400ms cubic-bezier(0.16,1,0.3,1), opacity 400ms ease",
          }}
        />
        <circle
          cx="280" cy="165" r="4"
          fill="var(--color-primary)"
          opacity={glowing ? 1 : 0}
          style={{ transition: "opacity 300ms ease" }}
        />

        {/* ====== CONNECTING ARC (above the KB line) ====== */}
        <path
          d="M 170 60 Q 280 -20 390 60"
          fill="none"
          stroke="url(#nx-arc-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="300"
          strokeDashoffset={arcVisible ? 0 : 300}
          opacity={fadingOut ? 0 : arcVisible ? 1 : 0}
          style={{
            transition: arcVisible
              ? "stroke-dashoffset 600ms cubic-bezier(0.16,1,0.3,1), opacity 400ms ease"
              : "opacity 400ms ease",
          }}
        />

        {/* Small dots at arc endpoints */}
        <circle cx="170" cy="60" r="3" fill="var(--color-primary)"
          opacity={fadingOut ? 0 : arcVisible ? 0.8 : 0}
          style={{ transition: "opacity 300ms ease" }}
        />
        <circle cx="390" cy="60" r="3" fill="var(--color-primary)"
          opacity={fadingOut ? 0 : arcVisible ? 0.8 : 0}
          style={{ transition: "opacity 300ms ease" }}
        />

        {/* ====== AUTO-LINKED LABEL ====== */}
        <g
          opacity={fadingOut ? 0 : labelVisible ? 1 : 0}
          style={{ transition: "opacity 400ms ease" }}
        >
          <rect
            x="237" y="2" width="86" height="22" rx="4"
            fill="var(--color-primary)"
            opacity="0.12"
          />
          <text
            x="280" y="17"
            textAnchor="middle"
            fill="var(--color-primary)"
            fontSize="11"
            fontWeight="700"
            fontFamily="inherit"
            letterSpacing="0.04em"
          >
            Auto-linked
          </text>
        </g>
      </svg>
    </div>
  );
}
