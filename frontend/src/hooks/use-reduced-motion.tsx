import { useReducedMotion } from "framer-motion";

/**
 * NEXUS accessibility hook for respecting user motion preferences.
 *
 * Returns `true` when the user has requested reduced motion
 * (via `prefers-reduced-motion: reduce` in their OS / browser settings).
 *
 * When true, all animated components should skip transitions
 * and render directly at their final state.
 */
export function usePrefersReducedMotion(): boolean {
  const prefersReduced = useReducedMotion();
  return prefersReduced ?? false;
}

