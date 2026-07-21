import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { hoverLift } from "@/lib/animations";

interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  /** Enable hover lift effect (default: true) */
  hoverable?: boolean;
}

/**
 * MotionCard — a motion-enhanced card component
 *
 * Wraps the standard shadcn card styling with subtle
 * hover lift, press feedback, and entrance animation support.
 */
export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ children, className, hoverable = true, ...props }, ref) => {
    const prefersReduced = usePrefersReducedMotion();

    return (
      <motion.div
        ref={ref}
        className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
        {...(hoverable && !prefersReduced ? hoverLift : {})}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
MotionCard.displayName = "MotionCard";

/**
 * StaggerContainer — wraps children with staggered entrance animation.
 * Each direct child with `staggerItem` variant will animate in sequence.
 */
export function StaggerContainer({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLMotionProps<"div">) {
  const prefersReduced = usePrefersReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.05, delayChildren: 0.05 },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem — a child item within a StaggerContainer.
 * Animates in with a fade + slide-up.
 */
export function StaggerItem({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & HTMLMotionProps<"div">) {
  const prefersReduced = usePrefersReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

