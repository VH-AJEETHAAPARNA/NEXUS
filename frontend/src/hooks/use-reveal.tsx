import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.15 },
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}

export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const style: CSSProperties = { animationDelay: `${delay}ms` };
  const Tag = as as "div";
  return (
    <Tag
      ref={ref as never}
      style={style}
      className={cn(inView ? "animate-fade-up" : "opacity-0", className)}
    >
      {children}
    </Tag>
  );
}

export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!Number.isFinite(target)) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    // ease-out-expo
    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutExpo(t);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function AnimatedNumber({ value }: { value: string | number }) {
  const str = String(value);
  const match = str.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  const num = match ? Number(match[1]) : NaN;
  const suffix = match ? match[2] : "";
  const animated = useCountUp(Number.isFinite(num) ? num : 0);
  const settled = animated === num;
  if (!match || !Number.isFinite(num)) return <>{str}</>;
  return (
    <span
      className={cn("inline-block origin-left tabular-nums", settled && "animate-count-settle")}
    >
      {animated}
      {suffix}
    </span>
  );
}
